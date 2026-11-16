import { expect, test } from "vitest";
import {
	buildWorldStandings,
	buildWorldBracket,
} from "./basketballWorldPresentation.ts";
import type {
	BasketballWorld,
	WorldGame,
	WorldTeam,
} from "./basketballWorld.ts";

const team = (id: number, conference = "A"): WorldTeam => ({
	id,
	name: `Team ${id}`,
	abbrev: `T${id}`,
	conference,
	prestige: 50,
	budget: 100,
	spent: 0,
	won: 99,
	lost: 99,
	confWon: 99,
	confLost: 99,
	pf: 0,
	pa: 0,
	coach: "Coach",
	coaching: 50,
});
const game = (
	id: number,
	home: number,
	away: number,
	pts: [number, number],
	extra: Partial<WorldGame> = {},
): WorldGame => ({
	id,
	day: id + 1,
	competition: "college",
	home,
	away,
	stage: "regular",
	pts,
	...extra,
});

test("standings derive regular-season records, splits and form without counting tournament games", () => {
	const rows = buildWorldStandings(
		[team(1), team(2)],
		[
			game(0, 1, 2, [80, 70], { conferenceGame: true }),
			game(1, 2, 1, [60, 65], { neutral: true }),
			game(2, 1, 2, [50, 100], { stage: "national" }),
		],
		"college",
	);
	const leader = rows[0]!;
	expect(leader.id).toBe(1);
	expect(leader.won).toBe(2);
	expect(leader.lost).toBe(0);
	expect(leader.gp).toBe(2);
	expect(leader.ppg).toBe(72.5);
	expect(leader.oppg).toBe(65);
	expect(leader.confWon).toBe(1);
	expect(leader.homeWon).toBe(1);
	expect(leader.awayWon).toBe(0);
	expect(leader.last10).toBe("2–0");
	expect(leader.streak).toBe("W2");
	expect(rows[1]?.gb).toBe(1);
});

test("conference ranks prioritize conference record and handle teams without games", () => {
	const rows = buildWorldStandings(
		[team(1), team(2), team(3, "B")],
		[
			game(0, 1, 2, [40, 50], { conferenceGame: true }),
			game(1, 1, 3, [70, 60]),
			game(2, 1, 3, [80, 60]),
		],
		"college",
	);
	expect(rows.find((t) => t.id === 2)?.conferenceRank).toBe(1);
	expect(buildWorldStandings([team(4)], [], "gLeague")[0]).toMatchObject({
		pct: 0,
		gp: 0,
		streak: "—",
		last10: "0–0",
		gb: 0,
	});
});

test("brackets preserve initial seeds and include later rounds and byes", () => {
	const tournament = {
		name: "National Championship",
		competition: "college" as const,
		stage: "national" as const,
		seeds: [1, 2, 3, 4, 5, 6],
		teams: [1],
		round: 4,
		day: 18,
		champion: 1,
	};
	const games = [
		game(0, 3, 6, [70, 50], { stage: "national", day: 10 }),
		game(1, 4, 5, [65, 60], { stage: "national", day: 10 }),
		game(2, 1, 4, [85, 60], { stage: "national", day: 12 }),
		game(3, 2, 3, [75, 72], { stage: "national", day: 12 }),
		game(4, 1, 2, [77, 70], { stage: "national", day: 14 }),
	];
	const world = {
		schools: [1, 2, 3, 4, 5, 6].map((id) => team(id)),
		games,
	} as BasketballWorld;
	const bracket = buildWorldBracket(world, tournament);
	expect(bracket.rounds).toHaveLength(3);
	expect(bracket.rounds[0]?.byes).toEqual([1, 2]);
	expect(bracket.rounds[0]?.games[0]).toMatchObject({
		homeSeed: 3,
		awaySeed: 6,
	});
	expect(bracket.rounds[2]?.name).toBe("Championship");
	expect(bracket.champion).toBe(1);
});

test("legacy conference brackets do not mix games from other tournaments", () => {
	const world = {
		schools: [team(1), team(2), team(3, "B"), team(4, "B")],
		games: [
			game(0, 1, 2, [70, 60], { stage: "conference" }),
			game(1, 3, 4, [90, 80], { stage: "conference" }),
		],
	} as BasketballWorld;
	const bracket = buildWorldBracket(world, {
		name: "A",
		competition: "college",
		stage: "conference",
		teams: [1],
		round: 2,
		day: 4,
		champion: 1,
	});
	expect(bracket.entrants).toBe(2);
	expect(bracket.rounds[0]?.games).toHaveLength(1);
	expect(bracket.rounds[0]?.games[0]?.homeSeed).toBeUndefined();
});
