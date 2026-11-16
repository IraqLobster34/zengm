import {
	getDefaultMods,
	isModEnabled,
	validateMods,
	type ModConfiguration,
} from "../../../common/mods.ts";
import setGameAttributes from "../league/setGameAttributes.ts";
import g from "../../util/g.ts";
import { idb } from "../../db/index.ts";
import { getMetaAttribute, putMetaAttribute } from "../../db/metaAttributes.ts";

export const getLeagueMods = () =>
	Object.hasOwn(g, "mods") ? g.get("mods") : undefined;

export const getModSelection = async (inLeague: boolean) =>
	(inLeague ? getLeagueMods() : await getMetaAttribute("defaultMods")) ??
	getDefaultMods();

export const isLeagueModEnabled = (id: string) =>
	isModEnabled(getLeagueMods(), id);

export const isCupLocked = () => {
	const cup = Object.hasOwn(g, "nbaCup") ? g.get("nbaCup") : undefined;
	return !!cup && cup.season === g.get("season") && cup.stage !== "complete";
};

export const saveModSelection = async ({
	configuration,
	inLeague,
}: {
	configuration: ModConfiguration;
	inLeague: boolean;
}) => {
	const mods = validateMods(configuration);
	if (inLeague) {
		if (g.get("lid") === undefined) {
			throw new Error("Open a league before changing its mods.");
		}
		if (
			isCupLocked() &&
			isModEnabled(mods, "nba-cup") !== isLeagueModEnabled("nba-cup")
		) {
			throw new Error("Finish the active NBA Cup before changing this mod.");
		}
		if (
			Object.hasOwn(g, "basketballWorld") &&
			g.get("basketballWorld") &&
			!isModEnabled(mods, "basketball-world")
		) {
			throw new Error(
				"Connected Basketball must stay enabled for this world. Create a separate league to play without it.",
			);
		}
		await setGameAttributes({ mods });
		await idb.cache.flush(["gameAttributes"]);
	} else {
		await putMetaAttribute("defaultMods", mods);
	}
	return mods;
};
