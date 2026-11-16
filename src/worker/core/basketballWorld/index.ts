import { PLAYER, RATINGS } from "../../../common/constants.ts";
import { isModEnabled } from "../../../common/mods.ts";
import {
	collegeEligibility,
	worldDayForNbaDay,
	nbaDraftEligible,
	emptyWorldStats,
	roundRobin,
	rankWorldTeams,
	WORLD_TIDS,
	type BasketballWorld,
	type BasketballPathway,
	type WorldTeam,
	type WorldGame,
	type WorldTournament,
	type WorldCompetition,
} from "../../../common/basketballWorld.ts";
import type { Player } from "../../../common/types.ts";
import { idb } from "../../db/index.ts";
import g from "../../util/g.ts";
import player from "../player/index.ts";
import setGameAttributes from "../league/setGameAttributes.ts";
import schoolsData from "../../data/basketballWorld/schools.json";
import affiliatesData from "../../data/basketballWorld/gLeague.json";
import defaultColleges from "../../data/defaultColleges.ts";
import { simulateWorldGame } from "./sim.ts";

export const worldEnabled = () =>
	__SPORT === "basketball" &&
	isModEnabled(
		Object.hasOwn(g, "mods") ? g.get("mods") : undefined,
		"basketball-world",
	);
export const getWorld = (): BasketballWorld | undefined =>
	Object.hasOwn(g, "basketballWorld") ? g.get("basketballWorld") : undefined;
const saveWorld = (world: BasketballWorld) =>
	setGameAttributes({ basketballWorld: { ...world } });
const rating = (p: Player) => p.ratings.at(-1)!;
const score = (p: Player) => rating(p).ovr + rating(p).pot * 0.35;
const shuffle = <T>(items: T[]) => {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[items[i], items[j]] = [items[j]!, items[i]!];
	}
	return items;
};
const news = (world: BasketballWorld, message: string) => {
	world.news.unshift(message);
	world.news = world.news.slice(0, 60);
};
const pathwayPlayers = async () =>
	(await idb.cache.players.getAll()).filter(
		(p) => p.basketballPathway && p.tid !== PLAYER.RETIRED,
	);
const rosters = (players: Player[], competition: WorldCompetition) => {
	const map = new Map<number, Player[]>();
	for (const p of players) {
		const path = p.basketballPathway;
		if (!path) {
			continue;
		}
		const teamId =
			competition === "college"
				? path.status === "college"
					? path.schoolId
					: undefined
				: path.status === "gLeague" || (path.assigned && p.tid >= 0)
					? path.affiliateId
					: undefined;
		if (teamId !== undefined) {
			const list = map.get(teamId) ?? [];
			list.push(p);
			map.set(teamId, list);
		}
	}
	return map;
};

export const makeWorldSchedule = (
	schools: WorldTeam[],
	affiliates: WorldTeam[],
): WorldGame[] => {
	const games: WorldGame[] = [];
	const add = (
		competition: WorldCompetition,
		home: number,
		away: number,
		day: number,
		conferenceGame = false,
	) =>
		games.push({
			id: games.length,
			day,
			competition,
			home,
			away,
			stage: "regular",
			conferenceGame,
		});
	// Non-conference rotation is shuffled independently; all conferences play
	// twenty league dates, with byes in odd-sized conferences.
	for (const [round, pairs] of roundRobin(
		shuffle(schools.map((t) => t.id)),
		11,
	).entries()) {
		for (const [a, b] of pairs) {
			add("college", a, b, 2 + round * 3);
		}
	}
	for (const conference of new Set(schools.map((t) => t.conference))) {
		for (const [round, pairs] of roundRobin(
			schools.filter((t) => t.conference === conference).map((t) => t.id),
			20,
		).entries()) {
			for (const [a, b] of pairs) {
				add("college", a, b, 38 + round * 4, true);
			}
		}
	}
	for (const [round, pairs] of roundRobin(
		affiliates.map((t) => t.id),
		50,
	).entries()) {
		for (const [a, b] of pairs) {
			add("gLeague", a, b, 3 + round * 3);
		}
	}
	return games;
};

const newPathway = (
	status: BasketballPathway["status"],
	enrolled: number,
): BasketballPathway => ({
	status,
	enrolled,
	highSchoolYear: enrolled - 1,
	seasonsPlayed: 0,
	gpa: 2.2 + Math.random() * 1.7,
	redshirt: false,
	nil: 0,
	interest: {},
	history: [],
});

const generatePlayer = async (
	world: BasketballWorld,
	status: "college" | "gLeague" | "recruit",
	team?: WorldTeam,
	year = 0,
) => {
	const age =
		status === "gLeague" ? 21 + Math.floor(Math.random() * 5) : 18 + year;
	const tid = WORLD_TIDS[status];
	const p = player.generate(
		tid,
		age,
		world.season + 1,
		false,
		50,
		await player.name(),
	);
	p.basketballPathway = newPathway(
		status,
		status === "recruit" ? world.season + 1 : world.season - year,
	);
	p.basketballPathway.highSchoolYear = p.born.year + 18;
	p.basketballPathway.seasonsPlayed = year;
	if (status === "college" && team) {
		p.basketballPathway.schoolId = team.id;
		p.college = team.name;
	}
	if (status === "gLeague" && team) {
		p.basketballPathway.affiliateId = team.id;
		p.draft.year = world.season - 1;
	}
	// Most college players are below NBA replacement level. Elite prospects
	// retain the same rating scale when they enter the NBA draft.
	const adjustment =
		status === "gLeague"
			? -8
			: -23 + (team?.prestige ?? 40) * 0.18 + year * 1.5;
	for (const key of RATINGS) {
		if (key !== "hgt") {
			(p.ratings[0] as unknown as Record<string, number>)[key] = Math.max(
				5,
				Math.min(
					95,
					Math.round(
						(p.ratings[0] as unknown as Record<string, number>)[key]! +
							adjustment,
					),
				),
			);
		}
	}
	await player.develop(p, 0, false, 50, true);
	p.ratings[0].pot = Math.min(
		90,
		p.ratings[0].ovr + Math.max(0, 28 - age) * (1.6 + Math.random() * 1.4),
	);
	p.draft.ovr = p.ratings[0].ovr;
	p.draft.pot = p.ratings[0].pot;
	await player.updateValues(p);
	await idb.cache.players.add(p);
	return p as Player;
};

const createWorld = async () => {
	if (!worldEnabled()) {
		return;
	}
	if (getWorld() && !getWorld()!.initializing) {
		return getWorld();
	}
	if (g.get("forceHistoricalRosters") || g.get("repeatSeason")) {
		throw new Error(
			"Connected Basketball requires historical roster forcing and repeat-season modes to be off.",
		);
	}
	const nbaTeams = (await idb.cache.teams.getAll()).filter((t) => !t.disabled);
	const schools: WorldTeam[] = schoolsData.map((t) => {
		const prestige = Math.min(
			95,
			Math.round(30 + Math.log(1 + (defaultColleges[t.name] ?? 1)) * 12),
		);
		return {
			id: t.id,
			name: t.name,
			abbrev: t.abbrev,
			conference:
				t.conference === "Metro Conference"
					? "Metro Atlantic Athletic Conference"
					: t.conference,
			prestige,
			budget: Math.round(100000 + prestige ** 2 * 350),
			spent: 0,
			won: 0,
			lost: 0,
			confWon: 0,
			confLost: 0,
			pf: 0,
			pa: 0,
			coach: "",
			coaching: prestige,
		};
	});
	const usedParents = new Set<number>();
	const affiliations = affiliatesData.map((t) => {
		const parent = t.parentAbbrev
			? nbaTeams.find(
					(n) =>
						!usedParents.has(n.tid) &&
						(n.srID === t.parentAbbrev ||
							n.abbrev === t.parentAbbrev ||
							n.region === t.parentRegion),
				)
			: undefined;
		if (parent) {
			usedParents.add(parent.tid);
		}
		return { t, parentTid: parent?.tid };
	});
	for (const row of affiliations) {
		if (row.t.parentAbbrev && row.parentTid === undefined) {
			const parent = nbaTeams.find((n) => !usedParents.has(n.tid));
			if (parent) {
				row.parentTid = parent.tid;
				usedParents.add(parent.tid);
			}
		}
	}
	const affiliates: WorldTeam[] = affiliations.map(({ t, parentTid }, i) => ({
		id: t.id,
		name: t.name,
		abbrev: t.abbrev,
		conference: i % 2 === 0 ? "East" : "West",
		prestige: 50,
		budget: 0,
		spent: 0,
		won: 0,
		lost: 0,
		confWon: 0,
		confLost: 0,
		pf: 0,
		pa: 0,
		coach: "",
		coaching: 60,
		parentTid,
	}));

	const world: BasketballWorld = getWorld() ?? {
		initializing: true,
		version: 1,
		rules: "2026-27-model-v1",
		season: g.get("season"),
		day: 0,
		stage: "regular",
		schools,
		affiliates,
		games: [],
		tournaments: [],
		draftPrepared: false,
		offseasonProcessed: false,
		archives: [],
		news: [],
	};
	await saveWorld(world);
	const existingPlayers = await pathwayPlayers();
	for (const school of world.schools) {
		const coach = await player.name();
		school.coach = `${coach.firstName} ${coach.lastName}`;
		const existing = existingPlayers.filter(
			(p) =>
				p.basketballPathway?.schoolId === school.id &&
				p.basketballPathway.status === "college",
		).length;
		for (let i = existing; i < 13; i++) {
			await generatePlayer(world, "college", school, i % 4);
		}
	}
	for (const affiliate of world.affiliates) {
		const existing = existingPlayers.filter(
			(p) => p.basketballPathway?.affiliateId === affiliate.id,
		).length;
		for (let i = existing; i < 10; i++) {
			await generatePlayer(world, "gLeague", affiliate);
		}
	}
	// Preserve pre-existing fictional draft prospects and their IDs by enrolling
	// them, instead of creating a second version of the same draft class.
	const prospects = await idb.cache.players.indexGetAll(
		"playersByTid",
		PLAYER.UNDRAFTED,
	);
	for (const p of prospects) {
		if (p.real || p.draft.year < world.season) {
			continue;
		}
		const counts = new Map<number, number>();
		for (const existing of await pathwayPlayers()) {
			if (existing.basketballPathway?.status === "college") {
				const id = existing.basketballPathway.schoolId!;
				counts.set(id, (counts.get(id) ?? 0) + 1);
			}
		}
		const availableSchools = world.schools.filter(
			(t) => (counts.get(t.id) ?? 0) < 15,
		);
		const school =
			availableSchools[Math.floor(Math.random() * availableSchools.length)];
		if (!school) {
			continue;
		}
		p.basketballPathway = newPathway("college", world.season);
		p.basketballPathway.schoolId = school.id;
		p.college = school.name;
		p.tid = WORLD_TIDS.college;
		p.basketballPathway.highSchoolYear = Math.min(
			world.season - 1,
			p.born.year + 18,
		);
		await idb.cache.players.put(p);
	}
	world.initializing = false;
	world.games = makeWorldSchedule(world.schools, world.affiliates);
	news(
		world,
		"College basketball and the G League are connected to this NBA league. Player identities and career records carry into the draft.",
	);
	await saveWorld(world);
	return world;
};

let creation: Promise<BasketballWorld | undefined> | undefined;
export const initializeWorld = async () => {
	if (!worldEnabled()) {
		return;
	}
	const current = getWorld();
	if (current && !current.initializing) {
		return current;
	}
	creation ??= createWorld().finally(() => {
		creation = undefined;
	});
	return await creation;
};

const addTournamentRound = (
	world: BasketballWorld,
	tournament: WorldTournament,
) => {
	tournament.seeds ??= [...tournament.teams];
	if (tournament.teams.length === 1) {
		tournament.champion = tournament.teams[0];
		return;
	}
	tournament.seeds ??= [...tournament.teams];
	const teams = tournament.teams;
	if (teams.length === 0) {
		return;
	}
	// Highest seeds receive byes until a power-of-two bracket is possible.
	const size = 2 ** Math.floor(Math.log2(teams.length - 1));
	const games = teams.length - size;
	for (let i = 0; i < games; i++) {
		world.games.push({
			id: world.games.length,
			day: tournament.day,
			competition: tournament.competition,
			home: teams[size - games + i]!,
			away: teams.at(-1 - i)!,
			stage: tournament.stage,
			tournament: tournament.name,
			round: tournament.round,
			neutral: true,
		});
	}
};

const startPostseason = (world: BasketballWorld) => {
	world.stage = "postseason";
	for (const conference of new Set(world.schools.map((t) => t.conference))) {
		const teams = world.schools
			.filter((t) => t.conference === conference)
			.sort(
				(a, b) =>
					b.confWon / Math.max(1, b.confWon + b.confLost) -
						a.confWon / Math.max(1, a.confWon + a.confLost) || b.won - a.won,
			);
		const tournament: WorldTournament = {
			name: conference,
			competition: "college",
			stage: "conference",
			teams: teams.map((t) => t.id),
			day: 120,
			round: 1,
		};
		world.tournaments.push(tournament);
		addTournamentRound(world, tournament);
	}
};

// Résumé model: strength of schedule and opponent-adjusted wins matter as well
// as efficiency. This is an approximation of selection, not the NCAA NET formula.
export const getSelectionScores = (teams: WorldTeam[], games: WorldGame[]) => {
	const byId = new Map(teams.map((t) => [t.id, t]));
	const strength = new Map<number, { sum: number; gp: number }>();
	for (const game of games) {
		if (game.competition !== "college" || !game.pts) {
			continue;
		}
		for (const [id, opponentId] of [
			[game.home, game.away],
			[game.away, game.home],
		]) {
			const opponent = byId.get(opponentId!);
			if (!opponent) {
				continue;
			}
			const record = strength.get(id!) ?? { sum: 0, gp: 0 };
			record.sum += opponent.won / Math.max(1, opponent.won + opponent.lost);
			record.gp++;
			strength.set(id!, record);
		}
	}
	return new Map(
		teams.map((team) => {
			const record = strength.get(team.id);
			return [
				team.id,
				(team.won / Math.max(1, team.won + team.lost)) * 65 +
					((record?.sum ?? 0) / Math.max(1, record?.gp ?? 0)) * 30 +
					(team.pf - team.pa) / Math.max(1, team.won + team.lost),
			];
		}),
	);
};

const startNational = (world: BasketballWorld) => {
	const auto = world.tournaments
		.filter((t) => t.stage === "conference")
		.map((t) => t.champion!)
		.filter((id) => id !== undefined);
	const scores = getSelectionScores(world.schools, world.games);
	const ranked = [...world.schools].sort(
		(a, b) => scores.get(b.id)! - scores.get(a.id)!,
	);
	const fieldSize = world.season >= 2026 ? 76 : 68;
	const field = [
		...new Set([
			...auto,
			...ranked
				.filter((t) => !auto.includes(t.id))
				.slice(0, fieldSize - auto.length)
				.map((t) => t.id),
		]),
	];
	field.sort(
		(a, b) =>
			ranked.findIndex((t) => t.id === a) - ranked.findIndex((t) => t.id === b),
	);
	for (const tournament of [
		{
			name: "National Championship",
			competition: "college",
			stage: "national",
			teams: field,
			day: world.day + 2,
			round: 1,
		},
		{
			name: "NIT",
			competition: "college",
			stage: "nit",
			teams: ranked
				.filter((t) => !field.includes(t.id))
				.slice(0, 32)
				.map((t) => t.id),
			day: world.day + 2,
			round: 1,
		},
	] satisfies WorldTournament[]) {
		if (tournament.teams.length > 0) {
			world.tournaments.push(tournament);
			addTournamentRound(world, tournament);
		}
	}
	news(
		world,
		`Selection day: ${field.length} schools enter the national championship. ${auto.length} conference champions received automatic bids.`,
	);
};

const playWorldDay = async (world: BasketballWorld, players: Player[]) => {
	world.day++;
	const college = rosters(players, "college");
	const development = rosters(players, "gLeague");
	const changed = new Set<Player>();
	for (const game of world.games.filter(
		(row) => row.day === world.day && !row.pts,
	)) {
		const pool = game.competition === "college" ? college : development;
		const home = pool.get(game.home) ?? [];
		const away = pool.get(game.away) ?? [];
		// Withdrawn/drafted players are removed only after postseason, so a
		// missing roster is a corrupt save rather than a silent forfeit.
		const result = simulateWorldGame(
			home,
			away,
			game.competition,
			game.neutral,
		);
		Object.assign(game, result);
		const teams =
			game.competition === "college" ? world.schools : world.affiliates;
		for (const side of [0, 1] as const) {
			const team = teams.find(
				(t) => t.id === (side === 0 ? game.home : game.away),
			)!;
			const other = side === 0 ? 1 : 0;
			if (result.pts[side] > result.pts[other]) {
				team.won++;
			} else {
				team.lost++;
			}
			if (game.conferenceGame) {
				if (result.pts[side] > result.pts[other]) {
					team.confWon++;
				} else {
					team.confLost++;
				}
			}
			team.pf += result.pts[side];
			team.pa += result.pts[other];
			for (const line of result.box[side]) {
				const p = (side === 0 ? home : away).find((p) => p.pid === line.pid)!;
				const path = p.basketballPathway!;
				let row = path.history.find(
					(row) =>
						row.season === world.season &&
						row.competition === game.competition &&
						row.teamId === team.id,
				);
				if (!row) {
					row = {
						...emptyWorldStats(),
						season: world.season,
						competition: game.competition,
						teamId: team.id,
						team: team.name,
					};
					path.history.push(row);
				}
				for (const key of Object.keys(emptyWorldStats()) as (keyof ReturnType<
					typeof emptyWorldStats
				>)[]) {
					row[key] += line[key];
				}
				changed.add(p);
			}
		}
	}
	if (world.day === 118) {
		startPostseason(world);
	}
	if (world.day === 153) {
		const tournament: WorldTournament = {
			name: "G League Playoffs",
			competition: "gLeague",
			stage: "playoffs",
			teams: rankWorldTeams(world.affiliates)
				.slice(0, 12)
				.map((t) => t.id),
			round: 1,
			day: 155,
		};
		world.tournaments.push(tournament);
		addTournamentRound(world, tournament);
	}
	for (const tournament of world.tournaments.filter(
		(t) => t.champion === undefined && t.day === world.day,
	)) {
		const played = world.games.filter(
			(game) =>
				game.stage === tournament.stage &&
				game.day === world.day &&
				game.competition === tournament.competition &&
				tournament.teams.includes(game.home) &&
				tournament.teams.includes(game.away),
		);
		const losers = new Set(
			played.map((game) =>
				game.pts![0] > game.pts![1] ? game.away : game.home,
			),
		);
		tournament.teams = tournament.teams.filter((id) => !losers.has(id));
		tournament.round++;
		tournament.day += 2;
		addTournamentRound(world, tournament);
		if (tournament.champion !== undefined) {
			news(
				world,
				`${tournament.name} champion: ${(tournament.competition === "college" ? world.schools : world.affiliates).find((t) => t.id === tournament.champion)!.name}.`,
			);
		}
	}
	if (
		world.tournaments.some((t) => t.stage === "conference") &&
		world.tournaments
			.filter((t) => t.stage === "conference")
			.every((t) => t.champion !== undefined) &&
		!world.tournaments.some((t) => t.stage === "national")
	) {
		startNational(world);
	}
	await idb.cache.players.putAll([...changed]);
	if (world.day >= 164) {
		world.stage = "offseason";
	}
};

export const advanceWorld = async (days: number, persist = true) => {
	if (!Number.isFinite(days) || days < 1) {
		throw new Error("Choose a positive number of days to simulate.");
	}
	if (!worldEnabled()) {
		return;
	}
	const world = await initializeWorld();
	if (!world || world.stage === "offseason") {
		return;
	}
	const players = await pathwayPlayers();
	for (const p of players) {
		const path = p.basketballPathway!;
		if (
			path.assigned &&
			!world.affiliates.some(
				(t) => t.id === path.affiliateId && t.parentTid === p.tid,
			)
		) {
			path.assigned = false;
			await idb.cache.players.put(p);
		}
	}
	const target = Math.min(164, world.day + Math.max(1, Math.min(164, days)));
	while (world.day < target) {
		await playWorldDay(world, players);
	}
	await saveWorld(world);
	if (persist) {
		await idb.cache.flush();
	}
};

export const syncWorldCalendar = async (nbaDay: number) => {
	if (!worldEnabled()) {
		return;
	}
	const world = await initializeWorld();
	if (!world || world.stage === "offseason") {
		return;
	}
	let target = 164;
	if (g.get("phase") < 3) {
		if (!world.nbaRegularSeasonDays) {
			const schedule = await idb.cache.schedule.getAll();
			world.nbaRegularSeasonDays = Math.max(
				nbaDay,
				...schedule.map((game) => game.day ?? 0),
			);
			await saveWorld(world);
		}
		target = worldDayForNbaDay(nbaDay, world.nbaRegularSeasonDays);
	}
	if (target > world.day) {
		await advanceWorld(target - world.day, false);
	}
};

export const prepareWorldDraft = async () => {
	if (!worldEnabled()) {
		return;
	}
	await initializeWorld();
	await advanceWorld(164, false);
	const world = getWorld()!;
	if (world.draftPrepared) {
		return;
	}
	const players = await pathwayPlayers();
	const ranked = players
		.filter(
			(p) =>
				p.basketballPathway!.status === "college" &&
				nbaDraftEligible(
					p.born.year,
					p.basketballPathway!.highSchoolYear,
					world.season,
				),
		)
		.sort((a, b) => score(b) - score(a));
	const draftSlots = Math.max(
		60,
		g.get("numActiveTeams") * g.get("numDraftRounds"),
	);
	const earlyEntrants = new Set(
		ranked.slice(0, draftSlots * 2).map((p) => p.pid),
	);
	let count = 0;
	for (const p of players) {
		const path = p.basketballPathway!;
		if (path.status !== "college") {
			continue;
		}
		if (
			!path.redshirt &&
			path.history.some((row) => row.season === world.season && row.gp > 0)
		) {
			path.seasonsPlayed++;
		}
		if (
			nbaDraftEligible(p.born.year, path.highSchoolYear, world.season) &&
			(earlyEntrants.has(p.pid) ||
				!collegeEligibility(path, world.season + 1).eligible)
		) {
			path.status = "draft";
			p.tid = PLAYER.UNDRAFTED;
			p.draft.year = world.season;
			count++;
			await player.updateValues(p);
		}
		await idb.cache.players.put(p);
	}
	world.draftPrepared = true;
	news(
		world,
		`${count} college players are available in the NBA draft with their college statistics and original player IDs.`,
	);
	await saveWorld(world);
};

const recruitAutomatically = async (
	world: BasketballWorld,
	players: Player[],
) => {
	const available = shuffle(
		players.filter(
			(p) =>
				p.tid !== PLAYER.RETIRED &&
				(p.basketballPathway?.status === "recruit" ||
					p.basketballPathway?.status === "portal"),
		),
	).sort((a, b) => score(b) - score(a));
	const rosterMap = rosters(players, "college");
	for (const school of shuffle([...world.schools]).sort(
		(a, b) => b.prestige - a.prestige,
	)) {
		const roster = rosterMap.get(school.id) ?? [];
		while (roster.length < 13) {
			const p = available.shift() ?? (await generatePlayer(world, "recruit"));
			const path = p.basketballPathway!;
			path.status = "college";
			path.schoolId = school.id;
			path.redshirt = false;
			p.tid = WORLD_TIDS.college;
			p.college = school.name;
			path.nil = Math.max(
				0,
				Math.min(
					school.budget - school.spent,
					Math.round((school.budget / 20) * (rating(p).pot / 70)),
				),
			);
			school.spent += path.nil;
			roster.push(p);
			await idb.cache.players.put(p);
		}
	}
};

export const finishWorldDraft = async () => {
	if (!worldEnabled() || !getWorld()) {
		return;
	}
	const world = getWorld()!;
	if (world.offseasonProcessed) {
		return;
	}
	for (const p of await pathwayPlayers()) {
		const path = p.basketballPathway!;
		if (path.status === "draft") {
			if (p.tid >= 0) {
				path.status = "nba";
			} else {
				path.status = "gLeague";
				path.affiliateId =
					world.affiliates[
						Math.floor(Math.random() * world.affiliates.length)
					]!.id;
				p.tid = WORLD_TIDS.gLeague;
				p.draft.year = world.season;
			}
		} else if (path.status === "college" && Math.random() < 0.13) {
			path.status = "portal";
			p.tid = WORLD_TIDS.recruit;
			path.nil = 0;
		}
		await idb.cache.players.put(p);
	}
	for (const school of world.schools) {
		school.spent = (await pathwayPlayers())
			.filter(
				(p) =>
					p.basketballPathway?.status === "college" &&
					p.basketballPathway.schoolId === school.id,
			)
			.reduce((sum, p) => sum + (p.basketballPathway?.nil ?? 0), 0);
	}
	for (let i = 0; i < world.schools.length * 4; i++) {
		await generatePlayer(world, "recruit");
	}
	await recruitAutomatically(world, await pathwayPlayers());
	world.offseasonProcessed = true;

	news(
		world,
		"College programs are handling recruiting and transfers automatically. Undrafted professionals have joined G League rosters; NBA draft picks retain their college histories.",
	);
	await saveWorld(world);
};

export const startWorldSeason = async () => {
	if (!worldEnabled()) {
		return;
	}
	const world = await initializeWorld();
	if (!world || world.season === g.get("season")) {
		return;
	}
	if (!world.offseasonProcessed) {
		throw new Error(
			"Complete the connected NBA draft before advancing the basketball world.",
		);
	}
	const players = await pathwayPlayers();
	const champion = (stage: WorldGame["stage"]) => {
		const t = world.tournaments.find((t) => t.stage === stage);
		return (stage === "playoffs" ? world.affiliates : world.schools).find(
			(team) => team.id === t?.champion,
		)?.name;
	};
	world.archives.push({
		season: world.season,
		collegeChampion: champion("national"),
		nitChampion: champion("nit"),
		gLeagueChampion: champion("playoffs"),
		draftPids: players
			.filter((p) => p.draft.year === world.season && p.draft.round > 0)
			.map((p) => p.pid),
		collegeStandings: world.schools.map((t) => ({
			name: t.name,
			won: t.won,
			lost: t.lost,
		})),
	});
	world.season = g.get("season");
	for (const p of players) {
		const path = p.basketballPathway!;
		if (p.tid >= 0) {
			path.assigned = false;
			path.status = "nba";
			await idb.cache.players.put(p);
			continue;
		}
		if (
			path.status === "college" &&
			!collegeEligibility(path, world.season).eligible
		) {
			path.status = "gLeague";
			path.affiliateId = world.affiliates[0]!.id;
			p.tid = WORLD_TIDS.gLeague;
		}
		if (path.status === "college" || path.status === "gLeague") {
			player.addRatingsRow(p, 50);
			await player.develop(p, 1, false, 50, true);
			rating(p).pot = Math.max(rating(p).ovr, rating(p).pot);
			path.redshirt = false;
		}
		await idb.cache.players.put(p);
	}
	const developmentRosters = rosters(players, "gLeague");
	for (const affiliate of world.affiliates) {
		const pool = (developmentRosters.get(affiliate.id) ?? []).sort(
			(a, b) => score(b) - score(a),
		);
		for (const p of pool.slice(12)) {
			p.tid = PLAYER.FREE_AGENT;
			p.basketballPathway!.status = "nba";
			p.basketballPathway!.assigned = false;
			player.setContractDemand(p, {
				amount: g.get("minContract"),
				exp: world.season,
			});
			await idb.cache.players.put(p);
		}
		for (let i = pool.length; i < 10; i++) {
			await generatePlayer(world, "gLeague", affiliate);
		}
	}
	await recruitAutomatically(world, players);
	const available = players.filter(
		(p) =>
			p.basketballPathway?.status === "recruit" ||
			p.basketballPathway?.status === "portal",
	);
	for (const p of available) {
		p.tid = PLAYER.RETIRED;
		p.retiredYear = world.season;
		await idb.cache.players.put(p);
	}

	for (const t of [...world.schools, ...world.affiliates]) {
		t.won = 0;
		t.lost = 0;
		t.confWon = 0;
		t.confLost = 0;
		t.pf = 0;
		t.pa = 0;
	}
	world.day = 0;
	delete world.nbaRegularSeasonDays;
	world.stage = "regular";
	world.draftPrepared = false;
	world.offseasonProcessed = false;
	world.tournaments = [];
	world.games = makeWorldSchedule(world.schools, world.affiliates);
	news(world, `The ${world.season} college and G League seasons have begun.`);
	await saveWorld(world);
};

export { automateWorldDevelopment } from "./automation.ts";

/** Compatibility response for older open tabs. Secondary clubs are autonomous. */
export const worldAction = async (_action: {
	type: string;
	pid?: number;
	days?: number;
	teamId?: number;
	nil?: number;
}) => {
	void _action;
	return await Promise.reject(
		new Error(
			"College and G League clubs are managed automatically. Advance the NBA calendar with the Play menu.",
		),
	);
};
