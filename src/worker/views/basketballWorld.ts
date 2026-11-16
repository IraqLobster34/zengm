import { PLAYER } from "../../common/constants.ts";
import { defineView } from "../util/defineView.ts";
import type { RouteParams } from "../../ui/router/types.ts";
import {
	getWorld,
	worldEnabled,
	getSelectionScores,
} from "../core/basketballWorld/index.ts";
import { collegeEligibility } from "../../common/basketballWorld.ts";
import {
	buildWorldStandings,
	buildWorldBracket,
} from "../../common/basketballWorldPresentation.ts";
import { idb } from "../db/index.ts";
import g from "../util/g.ts";

export default defineView({
	id: "basketballWorld",
	processInputs: (params: RouteParams<"basketballWorld">) => ({
		section: params.section ?? "college",
		team: params.team !== undefined ? Number(params.team) : undefined,
	}),
	load: async ({ inputs }) => {
		const enabled = worldEnabled();
		const world = enabled ? getWorld() : undefined;
		const section =
			inputs.section === "recruiting" ? "college" : inputs.section;
		const competition = section === "g_league" ? "gLeague" : "college";
		const selectedTeam = inputs.team;
		const players = (await idb.cache.players.getAll()).filter(
			(p) => p.tid !== PLAYER.RETIRED && p.basketballPathway,
		);
		const people = players.map((p) => {
			const path = p.basketballPathway!;
			const r = p.ratings.at(-1)!;
			return {
				pid: p.pid,
				name: `${p.firstName} ${p.lastName}`,
				age: g.get("season") - p.born.year,
				pos: r.pos,
				ovr: Math.round(r.ovr + r.fuzz),
				pot: Math.round(r.pot + r.fuzz),
				college: p.college,
				draftYear: p.draft.year,
				drafted: p.draft.round > 0,
				status: path.status,
				schoolId: path.schoolId,
				affiliateId: path.affiliateId,
				assigned: path.assigned ?? false,
				remaining: collegeEligibility(path, world?.season ?? g.get("season"))
					.remaining,
				redshirt: path.redshirt,
				history: path.history,
			};
		});
		const scores = world
			? getSelectionScores(world.schools, world.games)
			: new Map<number, number>();
		const rankings = world
			? [...world.schools]
					.sort((a, b) => scores.get(b.id)! - scores.get(a.id)!)
					.map((t) => t.id)
			: [];
		return {
			enabled,
			initialized: !!world && !world.initializing,
			section,
			selectedTeam,
			competition,
			season: world?.season ?? g.get("season"),
			day: world?.day ?? 0,
			stage: world?.stage ?? "regular",
			rules: world?.rules,
			schools: world?.schools ?? [],
			affiliates:
				world?.affiliates.map((t) => ({
					...t,
					parent:
						t.parentTid !== undefined
							? g.get("teamInfoCache")[t.parentTid]?.abbrev
							: undefined,
				})) ?? [],
			collegeStandings: world
				? buildWorldStandings(world.schools, world.games, "college")
				: [],
			gLeagueStandings: world
				? buildWorldStandings(world.affiliates, world.games, "gLeague")
				: [],
			brackets:
				world?.tournaments.map((t) => buildWorldBracket(world, t)) ?? [],
			archives: world?.archives ?? [],
			news: world?.news ?? [],
			rankings,
			roster: people.filter(
				(p) =>
					selectedTeam !== undefined &&
					(competition === "college"
						? p.status === "college" && p.schoolId === selectedTeam
						: (p.status === "gLeague" || p.assigned) &&
							p.affiliateId === selectedTeam),
			),
			latest:
				world?.games
					.filter(
						(game) =>
							game.pts &&
							game.competition === competition &&
							selectedTeam !== undefined &&
							(game.home === selectedTeam || game.away === selectedTeam),
					)
					.slice(-12)
					.reverse()
					.map(({ box, ...game }) => {
						void box;
						return game;
					}) ?? [],
			boxScore:
				section === "game"
					? world?.games.find((game) => game.id === selectedTeam)
					: undefined,
			prospects: people
				.filter(
					(p) =>
						p.status === "draft" ||
						(p.drafted && p.draftYear === world?.season),
				)
				.sort((a, b) => b.pot - a.pot)
				.slice(0, 200),
			hideRatings: g.get("challengeNoRatings"),
		};
	},
});
