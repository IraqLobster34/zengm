import loadGameAttributes from "../league/loadGameAttributes.ts";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getDefaultMods } from "../../../common/mods.ts";
import { resetG, resetCache } from "../../../test/helpers.ts";
import g from "../../util/g.ts";
import { idb } from "../../db/index.ts";
import {
	getModSelection,
	isLeagueModEnabled,
	saveModSelection,
} from "./index.ts";
import {
	canStartCup,
	makeCupSchedule,
	getCupSeason,
} from "../season/nbaCup.ts";

beforeEach(async () => {
	resetG();
	g.setWithoutSavingToDB("mods", undefined);
	g.setWithoutSavingToDB("nbaCup", null);
	g.setWithoutSavingToDB("nbaCupHistory", {});
	g.setWithoutSavingToDB("lid", 1);
	await resetCache({});
});

afterEach(() => {
	vi.restoreAllMocks();
	g.setWithoutSavingToDB("mods", undefined);
	g.setWithoutSavingToDB("nbaCup", null);
	g.setWithoutSavingToDB("nbaCupHistory", {});
});

const disabledMods = () => ({
	"nba-cup": { enabled: false, version: "1.0.0" },
});

test("main-menu defaults persist independently of the open league", async () => {
	const put = vi.spyOn(idb.meta, "put").mockResolvedValue("defaultMods");
	vi.spyOn(idb.meta, "get").mockResolvedValue(disabledMods());
	await saveModSelection({ configuration: disabledMods(), inLeague: false });
	expect(put).toHaveBeenCalledWith("attributes", disabledMods(), "defaultMods");
	expect(await getModSelection(false)).toEqual(disabledMods());
	expect(isLeagueModEnabled("nba-cup")).toBe(true);
});

test("league selection is saved and controls season scheduling", async () => {
	const teams = Array.from({ length: 30 }, (_, tid) => ({
		tid,
		seasonAttrs: { cid: tid < 15 ? 0 : 1 },
	}));
	g.setWithoutSavingToDB("phase", 0);
	g.setWithoutSavingToDB("numGames", 82);
	expect(canStartCup(teams)).toBe(true);
	await saveModSelection({ configuration: disabledMods(), inLeague: true });
	expect(canStartCup(teams)).toBe(false);
	expect((await idb.cache.gameAttributes.get("mods"))?.value).toEqual(
		disabledMods(),
	);
	await saveModSelection({ configuration: getDefaultMods(), inLeague: true });
	expect(canStartCup(teams)).toBe(true);
});

test("reject disabling an active Cup, preserve completed Cup history", async () => {
	const teams = Array.from({ length: 30 }, (_, tid) => ({
		tid,
		seasonAttrs: { cid: tid < 15 ? 0 : 1 },
	}));
	const cup = makeCupSchedule(
		[{ homeTid: 0, awayTid: 1, day: 20 }],
		teams,
		g.get("season"),
		0,
	).cup;
	g.setWithoutSavingToDB("nbaCup", cup);
	await expect(
		saveModSelection({ configuration: disabledMods(), inLeague: true }),
	).rejects.toThrow("Finish the active NBA Cup");
	expect(isLeagueModEnabled("nba-cup")).toBe(true);
	cup.stage = "complete";
	g.setWithoutSavingToDB("nbaCup", cup);
	await saveModSelection({ configuration: disabledMods(), inLeague: true });
	expect(getCupSeason(cup.season)).toEqual(cup);
});

test("switching to a legacy save clears the previous league's mod selection", async () => {
	g.setWithoutSavingToDB("mods", disabledMods());
	await loadGameAttributes();
	expect(isLeagueModEnabled("nba-cup")).toBe(true);
	expect(g.get("mods")).toBeUndefined();
});
