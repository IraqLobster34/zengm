import type { CupGame, NbaCup } from "../../../common/nbaCup.ts";
import { cupQualifiers } from "../../../common/nbaCup.ts";
import type {
	Conditions,
	ScheduleGameWithoutKey,
} from "../../../common/types.ts";
import { PHASE } from "../../../common/constants.ts";
import { shuffle } from "../../../common/random.ts";
import { idb } from "../../db/index.ts";
import { g, helpers, logEvent } from "../../util/index.ts";
import setGameAttributes from "../league/setGameAttributes.ts";
import addAward from "../player/addAward.ts";
import type { Game } from "../../../common/types.ts";

type CupTeam = { tid: number; seasonAttrs: { cid: number } };

export const getCup = () =>
	Object.hasOwn(g, "nbaCup") ? g.get("nbaCup") : undefined;

export const getCupHistory = () =>
	Object.hasOwn(g, "nbaCupHistory") ? g.get("nbaCupHistory") : undefined;

export const getCupSeason = (season: number) =>
	getCup()?.season === season ? getCup() : getCupHistory()?.[season];

export const selectCupMvp = (cup: NbaCup, games: Game[]) => {
	const final = games.find((game) => game.nbaCup === "final");
	const roster = final?.teams.find(
		(team) => team.tid === cup.champion,
	)?.players;
	if (!roster) {
		return;
	}
	const scores = new Map<number, number>();
	for (const game of games) {
		for (const team of game.teams) {
			for (const p of team.players) {
				if (p.min > 0 && roster.some((player) => player.pid === p.pid)) {
					scores.set(p.pid, (scores.get(p.pid) ?? 0) + helpers.gameScore(p));
				}
			}
		}
	}
	const pid = [...scores].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0];
	const p = roster.find((player) => player.pid === pid);
	if (p) {
		return { pid: p.pid, tid: cup.champion!, name: p.name };
	}
};

export const grantCupAwards = async (cup: NbaCup) => {
	if (
		cup.stage !== "complete" ||
		cup.awardsGranted ||
		cup.champion === undefined
	) {
		return false;
	}
	const games: Game[] = [];
	for (const game of cup.games) {
		const completed = await idb.merged.games.get(game.gid);
		if (completed) {
			games.push(completed);
		}
	}
	const final = games.find((game) => game.nbaCup === "final");
	const roster = final?.teams.find(
		(team) => team.tid === cup.champion,
	)?.players;
	if (!roster) {
		return false;
	}
	const mvp = selectCupMvp(cup, games);
	if (!mvp) {
		return false;
	}
	for (const { pid } of roster) {
		const p = await idb.merged.players.get(pid);
		if (p) {
			addAward(p, { season: cup.season, type: "NBA Cup Winner" });
			if (pid === mvp.pid) {
				addAward(p, { season: cup.season, type: "NBA Cup MVP" });
			}
			await idb.cache.players.put(p);
		}
	}
	cup.mvp = mvp;
	cup.awardsGranted = true;
	return true;
};

export const canStartCup = (teams: CupTeam[]) => {
	const cids = [...new Set(teams.map((team) => team.seasonAttrs.cid))];
	return (
		__SPORT === "basketball" &&
		g.get("phase") === PHASE.PRESEASON &&
		g.get("numGames") === 82 &&
		teams.length === 30 &&
		cids.length === 2 &&
		cids.every(
			(cid) =>
				teams.filter((team) => team.seasonAttrs.cid === cid).length === 15,
		)
	);
};

export const makeCupSchedule = (
	base: ScheduleGameWithoutKey[],
	teams: CupTeam[],
	season: number,
	firstGid: number,
) => {
	const groups: NbaCup["groups"] = [];
	for (const cid of new Set(teams.map((team) => team.seasonAttrs.cid))) {
		const tids = teams
			.filter((team) => team.seasonAttrs.cid === cid)
			.map((team) => team.tid);
		shuffle(tids);
		for (let i = 0; i < 15; i += 5) {
			groups.push({ cid, tids: tids.slice(i, i + 5) });
		}
	}
	const schedule: ScheduleGameWithoutKey[] = [];
	const games: CupGame[] = [];
	let gid = firstGid;
	// Five group nights, interleaved with the first twenty ordinary schedule days.
	for (let day = 1; day <= Math.max(...base.map((game) => game.day)); day++) {
		for (const game of base.filter((game) => game.day === day)) {
			schedule.push({
				...game,
				day: day + Math.min(5, Math.floor((day - 1) / 4)) + (day > 20 ? 6 : 0),
				gid: gid++,
			});
		}
		if (day <= 20 && day % 4 === 0) {
			const round = day / 4 - 1;
			for (const group of groups) {
				// Rotating pairs on a five-team circle: one bye, two games per group.
				for (let offset = 1; offset <= 2; offset++) {
					const homeTid = group.tids[(round + offset) % 5]!;
					const awayTid = group.tids[(round - offset + 5) % 5]!;
					const game: CupGame = {
						homeTid,
						awayTid,
						day: day + round + 1,
						gid: gid++,
						stage: "group",
					};
					games.push(game);
					schedule.push({ ...game, nbaCup: "group" });
				}
			}
			// Reserve IDs before later regular-season games so every cache reader
			// sees chronological order, including sim-to-game and the top bar.
			if (day === 20) {
				gid += 31;
			}
		}
	}
	const nextGid = Math.max(...games.map((game) => game.gid)) + 1;
	const cup: NbaCup = {
		season,
		groups,
		games,
		stage: "group",
		knockoutDay: 27,
		nextGid,
	};
	return { schedule, cup };
};

const winner = (game: CupGame) =>
	game.pts![0] > game.pts![1] ? game.homeTid : game.awayTid;
const loser = (game: CupGame) =>
	game.pts![0] > game.pts![1] ? game.awayTid : game.homeTid;

// Pure transition, also used by tests. Each team gets two regular-season
// games during the knockout window, including consolation games.
export const advanceCup = (cup: NbaCup): ScheduleGameWithoutKey[] => {
	if (cup.stage === "complete") {
		return [];
	}
	const round = cup.games.filter((game) => game.stage === cup.stage);
	if (round.some((game) => !game.pts)) {
		return [];
	}
	const scheduled: ScheduleGameWithoutKey[] = [];
	const add = (
		homeTid: number,
		awayTid: number,
		day: number,
		stage?: CupGame["stage"],
	) => {
		const gid = cup.nextGid++;
		scheduled.push({ gid, homeTid, awayTid, day, nbaCup: stage });
		if (stage) {
			cup.games.push({ gid, homeTid, awayTid, day, stage });
		}
	};
	const pair = (tids: number[], day: number, reverse = false) => {
		for (let i = 0; i < tids.length; i += 2) {
			add(tids[i + Number(reverse)]!, tids[i + Number(!reverse)]!, day);
		}
	};
	if (cup.stage === "group") {
		cup.seeds = cupQualifiers(cup);
		for (const seeds of cup.seeds) {
			add(seeds[0]!, seeds[3]!, cup.knockoutDay, "quarterfinal");
			add(seeds[1]!, seeds[2]!, cup.knockoutDay, "quarterfinal");
		}
		// 22 eliminated teams need two games each. Pair across conferences to
		// avoid the odd number (11) of non-qualifiers in each conference.
		const eliminated = cup.groups
			.flatMap((group) => group.tids)
			.filter((tid) => !cup.seeds!.flat().includes(tid));
		pair(eliminated, cup.knockoutDay);
		pair(eliminated, cup.knockoutDay + 2, true);
		cup.stage = "quarterfinal";
	} else if (cup.stage === "quarterfinal") {
		for (const seeds of cup.seeds!) {
			const games = round.filter((game) => seeds.includes(game.homeTid));
			const winners = games
				.map(winner)
				.sort((a, b) => seeds.indexOf(a) - seeds.indexOf(b));
			add(winners[0]!, winners[1]!, cup.knockoutDay + 2, "semifinal");
			pair(games.map(loser), cup.knockoutDay + 2);
		}
		cup.stage = "semifinal";
	} else if (cup.stage === "semifinal") {
		add(winner(round[0]!), winner(round[1]!), cup.knockoutDay + 4, "final");
		cup.stage = "final";
	} else {
		cup.champion = winner(round[0]!);
		cup.stage = "complete";
	}
	return scheduled;
};

export const updateCup = async (conditions: Conditions) => {
	const current = getCup();
	if (
		__SPORT !== "basketball" ||
		!current ||
		current.season !== g.get("season")
	) {
		return;
	}
	const cup = helpers.deepCopy(current);
	if (cup.stage === "complete") {
		if (await grantCupAwards(cup)) {
			await setGameAttributes({ nbaCup: cup });
		}
		return;
	}
	for (const game of cup.games) {
		if (!game.pts) {
			const completed = await idb.cache.games.get(game.gid);
			if (completed) {
				game.pts = [completed.teams[0].pts, completed.teams[1].pts];
			}
		}
	}
	const scheduled = advanceCup(cup);
	await idb.cache.schedule.addAll(scheduled);
	await grantCupAwards(cup);
	await setGameAttributes({ nbaCup: cup });
	if (cup.champion !== undefined) {
		const t = g.get("teamInfoCache")[cup.champion!]!;
		logEvent(
			{
				type: "info",
				text: `The ${t.region} ${t.name} won the NBA Cup!${cup.mvp ? ` ${cup.mvp.name} won NBA Cup MVP.` : ""} <a href="${helpers.leagueUrl(["nba_cup", cup.season])}">View the tournament</a>.`,
				tids: [cup.champion!],
				showNotification: true,
				score: 20,
			},
			conditions,
		);
	}
};
