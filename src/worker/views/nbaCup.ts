import { defineView } from "../util/defineView.ts";
import { validateSeasonOnly } from "../util/processInputs.ts";
import {
	getCup,
	getCupHistory,
	getCupSeason,
	grantCupAwards,
} from "../core/season/nbaCup.ts";
import setGameAttributes from "../core/league/setGameAttributes.ts";
import { g, helpers } from "../util/index.ts";
import type { PlayoffSeries } from "../../common/types.ts";
import { idb } from "../db/index.ts";

export default defineView({
	id: "nbaCup",
	processInputs: validateSeasonOnly,
	load: async ({ inputs, updateEvents, prevInputs }) => {
		if (
			updateEvents.has("firstRun") ||
			updateEvents.has("gameSim") ||
			updateEvents.has("newPhase") ||
			inputs.season !== prevInputs?.season
		) {
			let cup = getCupSeason(inputs.season);
			// Backfill current and archived cups when their saved box scores exist.
			if (
				__SPORT === "basketball" &&
				cup?.stage === "complete" &&
				!cup.awardsGranted
			) {
				cup = helpers.deepCopy(cup);
				if (await grantCupAwards(cup)) {
					if (getCup()?.season === cup.season) {
						await setGameAttributes({ nbaCup: cup });
					} else {
						await setGameAttributes({
							nbaCupHistory: { ...getCupHistory(), [cup.season]: cup },
						});
					}
					await idb.cache.flush(["players", "gameAttributes"]);
				}
			}
			const series: PlayoffSeries["series"] = [[], [], []];
			if (cup) {
				for (const [round, stage] of (
					["quarterfinal", "semifinal", "final"] as const
				).entries()) {
					for (const game of cup.games.filter((game) => game.stage === stage)) {
						const makeTeam = (tid: number, i: 0 | 1) => ({
							tid,
							cid: cup.groups.find((group) => group.tids.includes(tid))!.cid,
							seed:
								(cup.seeds
									?.find((seeds) => seeds.includes(tid))
									?.indexOf(tid) ?? 0) + 1,
							won: game.pts && game.pts[i] > game.pts[i === 0 ? 1 : 0] ? 1 : 0,
							pts: game.pts?.[i],
						});
						series[round]!.push({
							home: makeTeam(game.homeTid, 0),
							away: makeTeam(game.awayTid, 1),
							gids: game.pts ? [game.gid] : [],
						});
					}
				}
			}
			return {
				cup: __SPORT === "basketball" ? cup : undefined,
				season: inputs.season,
				series: await helpers.augmentSeries(series, inputs.season),
				confNames: (cup
					? [...new Set(cup.groups.map((group) => group.cid))]
					: []
				).map(
					(cid) =>
						g.get("confs", inputs.season).find((conf) => conf.cid === cid)
							?.name ?? "Conference",
				),
			};
		}
	},
});
