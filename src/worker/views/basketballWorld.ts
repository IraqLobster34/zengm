import { PLAYER } from "../../common/constants.ts";
import { defineView } from "../util/defineView.ts";
import type { RouteParams } from "../../ui/router/types.ts";
import { getWorld, worldEnabled } from "../core/basketballWorld/index.ts";
import { collegeEligibility } from "../../common/basketballWorld.ts";
import { getSelectionScores } from "../core/basketballWorld/index.ts";
import { idb } from "../db/index.ts";
import g from "../util/g.ts";

export default defineView({
	id: "basketballWorld",
	processInputs: (params: RouteParams<"basketballWorld">) => ({
		section: params.section ?? "college",
		team: params.team ? Number(params.team) : undefined,
	}),
	load: async ({ inputs }) => {
		const world = getWorld();
		const schoolId = inputs.team ?? world?.userSchoolId;
		const players = (await idb.cache.players.getAll()).filter(
			(p) =>
				p.tid !== PLAYER.RETIRED &&
				(p.basketballPathway || g.get("userTids").includes(p.tid)),
		);
		const people = players.map((p) => {
			const path = p.basketballPathway;
			const ratings = p.ratings.at(-1)!;
			return {
				pid: p.pid,
				name: `${p.firstName} ${p.lastName}`,
				tid: p.tid,
				age: g.get("season") - p.born.year,
				pos: ratings.pos,
				ovr: Math.round(
					ratings.ovr + (g.get("challengeNoRatings") ? 0 : ratings.fuzz),
				),
				pot: Math.round(ratings.pot),
				college: p.college,
				draftYear: p.draft.year,
				drafted: p.draft.round > 0,
				status: path?.status ?? "nba",
				schoolId: path?.schoolId,
				affiliateId: path?.affiliateId,
				assigned: path?.assigned ?? false,
				remaining: path
					? collegeEligibility(path, world?.season ?? g.get("season")).remaining
					: 0,
				redshirt: path?.redshirt ?? false,
				gpa: path?.gpa ?? 0,
				nil: path?.nil ?? 0,
				interest: path?.interest[world?.userSchoolId ?? -1] ?? 0,
				history: path?.history ?? [],
			};
		});
		const scores = world
			? getSelectionScores(world.schools, world.games)
			: new Map<number, number>();
		const latest =
			world?.games
				.filter(
					(game) =>
						game.pts &&
						(inputs.section === "g_league"
							? game.competition === "gLeague" &&
								(inputs.team === undefined ||
									game.home === inputs.team ||
									game.away === inputs.team)
							: game.competition === "college" &&
								(game.home === schoolId || game.away === schoolId)),
				)
				.slice(-30)
				.reverse() ?? [];
		return {
			enabled: worldEnabled(),
			initialized: !!world && !world.initializing,
			section: inputs.section,
			season: world?.season ?? g.get("season"),
			day: world?.day ?? 0,
			stage: world?.stage ?? "regular",
			schools: world?.schools ?? [],
			affiliates: world?.affiliates ?? [],
			schoolId,
			userSchoolId: world?.userSchoolId,
			recruitingPoints: world?.recruitingPoints ?? 0,
			recruitingOpen: world?.offseasonProcessed ?? false,
			rules: world?.rules,
			tournaments: world?.tournaments ?? [],
			archives: world?.archives ?? [],
			news: world?.news ?? [],
			latest,
			roster: people.filter((p) =>
				inputs.section === "g_league"
					? p.affiliateId ===
							(inputs.team ??
								world?.affiliates.find((t) => t.parentTid === g.get("userTid"))
									?.id) &&
						(p.status === "gLeague" || p.assigned)
					: p.status === "college" && p.schoolId === schoolId,
			),
			recruits: people
				.filter((p) => p.status === "recruit" || p.status === "portal")
				.sort((a, b) => b.pot - a.pot)
				.slice(0, 150),
			prospects: people
				.filter(
					(p) =>
						p.status === "draft" ||
						(p.drafted && p.draftYear === world?.season),
				)
				.sort((a, b) => b.pot - a.pot)
				.slice(0, 200),
			nbaRoster: people.filter((p) => g.get("userTids").includes(p.tid)),
			callUps: people
				.filter(
					(p) =>
						p.status === "gLeague" &&
						p.tid < 0 &&
						p.draftYear <= g.get("season"),
				)
				.sort((a, b) => b.ovr - a.ovr)
				.slice(0, 80),
			rankings: world
				? [...world.schools]
						.sort((a, b) => scores.get(b.id)! - scores.get(a.id)!)
						.slice(0, 25)
						.map((t) => t.id)
				: [],
			hideRatings: g.get("challengeNoRatings"),
		};
	},
});
