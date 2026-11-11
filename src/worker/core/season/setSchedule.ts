import { idb } from "../../db/index.ts";
import { g } from "../../util/index.ts";
import type {
	ScheduleGame,
	ScheduleGameWithoutKey,
} from "../../../common/types.ts";
import addDaysToSchedule from "./addDaysToSchedule.ts";
import { PHASE } from "../../../common/constants.ts";
import { isFinals } from "./isFinals.ts";
import { recomputeLocalUITeamOvrs } from "../../util/recomputeLocalUITeamOvrs.ts";
import {
	canStartCup,
	makeCupSchedule,
	getCup,
	getCupHistory,
} from "./nbaCup.ts";
import setGameAttributes from "../league/setGameAttributes.ts";

const makePlayoffsKey = (game: ScheduleGameWithoutKey) =>
	JSON.stringify([game.homeTid, game.awayTid]);

/**
 * Save the schedule to the database, overwriting what's currently there.
 *
 * @param {Array} tids A list of lists, each containing the team IDs of the home and
        away teams, respectively, for every game in the season, respectively.
 * @return {Promise}
 */
const setSchedule = async (tids: [number, number][]) => {
	const playoffs = g.get("phase") === PHASE.PLAYOFFS;

	const oldPlayoffGames: Record<string, ScheduleGame> = {};
	if (playoffs) {
		// If live simming an individual playoff game, setSchedule gets called afterwards with the remaining games that day. But that means it forgets forceWin! So we need to keep track of old forceWin values. Same with gid, which messes with LeagueTopBar if it changes.
		const oldSchedule = await idb.cache.schedule.getAll();

		for (const game of oldSchedule) {
			const key = makePlayoffsKey(game);
			oldPlayoffGames[key] = game;
		}
	}

	await idb.cache.schedule.clear();

	const finals = playoffs && (await isFinals());

	let schedule = addDaysToSchedule(
		tids.map(([homeTid, awayTid]) => ({
			homeTid,
			awayTid,
		})),
		await idb.cache.games.getAll(),
	);
	for (const game of schedule) {
		if (playoffs) {
			const key = makePlayoffsKey(game);
			if (oldPlayoffGames[key]) {
				game.day = oldPlayoffGames[key].day;
				game.gid = oldPlayoffGames[key].gid;
				game.forceWin = oldPlayoffGames[key].forceWin;
			}

			// Track if game is a finals game or not, used along with neutralSite
			if (finals) {
				game.finals = true;
			}
		}
	}

	if (__SPORT === "basketball" && g.get("phase") === PHASE.PRESEASON) {
		const previous = getCup();
		if (previous?.stage === "complete") {
			await setGameAttributes({
				nbaCupHistory: { ...getCupHistory(), [previous.season]: previous },
			});
		}
		const teams = (await idb.cache.teams.getAll())
			.filter((t) => !t.disabled)
			.map((t) => ({ tid: t.tid, seasonAttrs: { cid: t.cid } }));
		if (canStartCup(teams)) {
			// The games cache contains only this season. Use the global high-water
			// marks so new schedules cannot overwrite archived seasons' box scores.
			const firstGid =
				Math.max(idb.cache._maxIds.games, idb.cache._maxIds.schedule) + 1;
			const plan = makeCupSchedule(schedule, teams, g.get("season"), firstGid);
			schedule = plan.schedule;
			await setGameAttributes({ nbaCup: plan.cup });
		} else {
			await setGameAttributes({ nbaCup: null });
		}
	}

	await idb.cache.schedule.addAll(schedule);

	await recomputeLocalUITeamOvrs();
};

export default setSchedule;
