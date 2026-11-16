import { PHASE } from "../../../common/constants.ts";
import { isModEnabled } from "../../../common/mods.ts";
import type { Player } from "../../../common/types.ts";
import { idb } from "../../db/index.ts";
import g from "../../util/g.ts";
const rating = (p: Player) => p.ratings.at(-1)!;
export const automateWorldDevelopment = async () => {
	const world = Object.hasOwn(g, "basketballWorld")
		? g.get("basketballWorld")
		: undefined;
	if (
		!isModEnabled(
			Object.hasOwn(g, "mods") ? g.get("mods") : undefined,
			"basketball-world",
		) ||
		!world ||
		world.initializing
	) {
		return;
	}
	const players = await idb.cache.players.getAll();
	const regular =
		(g.get("phase") === PHASE.REGULAR_SEASON ||
			g.get("phase") === PHASE.AFTER_TRADE_DEADLINE) &&
		world.day < 150;
	const minimum = Math.max(10, g.get("minRosterSize"));
	const changed = new Set<Player>();
	for (const p of players) {
		const path = p.basketballPathway;
		if (
			path?.assigned &&
			(!regular ||
				!world.affiliates.some(
					(t) => t.id === path.affiliateId && t.parentTid === p.tid,
				))
		) {
			path.assigned = false;
			changed.add(p);
		}
	}
	if (regular) {
		for (const affiliate of world.affiliates) {
			if (affiliate.parentTid === undefined) {
				continue;
			}
			const roster = players
				.filter((p) => p.tid === affiliate.parentTid)
				.sort((a, b) => rating(b).ovr - rating(a).ovr);
			// Recall whenever NBA injuries or roster changes make an assignment unsafe.
			for (const p of roster.filter((p) => p.basketballPathway?.assigned)) {
				const healthy = roster.filter(
					(other) =>
						!other.basketballPathway?.assigned &&
						other.injury.gamesRemaining === 0,
				).length;
				if (
					healthy < minimum ||
					roster.indexOf(p) < 8 ||
					p.injury.gamesRemaining > 0
				) {
					p.basketballPathway!.assigned = false;
					changed.add(p);
				}
			}
			let assigned = roster.filter((p) => p.basketballPathway?.assigned).length;
			for (const p of [...roster].reverse()) {
				if (assigned >= 2) {
					break;
				}
				if (
					p.basketballPathway?.assigned ||
					roster.indexOf(p) < 8 ||
					p.injury.gamesRemaining > 0 ||
					g.get("season") - p.draft.year > 2 ||
					rating(p).pot - rating(p).ovr < 5
				) {
					continue;
				}
				if (
					roster.filter(
						(other) =>
							!other.basketballPathway?.assigned &&
							other.injury.gamesRemaining === 0,
					).length <= minimum
				) {
					break;
				}
				p.basketballPathway ??= {
					status: "nba",
					enrolled: world.season - 4,
					highSchoolYear: p.born.year + 18,
					seasonsPlayed: 0,
					gpa: 3,
					redshirt: false,
					nil: 0,
					interest: {},
					history: [],
				};
				p.basketballPathway.assigned = true;
				p.basketballPathway.affiliateId = affiliate.id;
				changed.add(p);
				assigned++;
			}
		}
	}
	await idb.cache.players.putAll([...changed]);
};
