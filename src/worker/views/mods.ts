import g from "../util/g.ts";
import { defineView } from "../util/defineView.ts";
import type { RouteParams } from "../../ui/router/types.ts";
import { getModSelection, isCupLocked } from "../core/mods/index.ts";
import { getCup, getCupHistory } from "../core/season/nbaCup.ts";

export default defineView({
	id: "mods",
	processInputs: (params: RouteParams<"mods">) => ({
		inLeague: params.lid !== undefined,
	}),
	load: async ({ inputs: { inLeague } }) => ({
		inLeague,
		lid: inLeague ? g.get("lid") : undefined,
		configuration: await getModSelection(inLeague),
		cupLocked: inLeague && isCupLocked(),
		worldLocked:
			inLeague &&
			Object.hasOwn(g, "basketballWorld") &&
			!!g.get("basketballWorld"),
		hasCupHistory:
			inLeague && (!!getCup() || Object.keys(getCupHistory() ?? {}).length > 0),
	}),
});
