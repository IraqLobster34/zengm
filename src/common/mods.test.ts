import { resolveModsForNewLeague } from "./mods.ts";
import { expect, test } from "vitest";
import {
	getDefaultMods,
	isModEnabled,
	modRegistry,
	validateMods,
} from "./mods.ts";

test("legacy saves retain the Cup while explicit selections can disable it", () => {
	expect(isModEnabled(undefined, "nba-cup", "basketball")).toBe(true);
	expect(isModEnabled({}, "nba-cup", "basketball")).toBe(false);
	expect(isModEnabled(undefined, "nba-cup", "football")).toBe(false);
	expect(getDefaultMods("hockey")["nba-cup"]!.enabled).toBe(false);
});

test("imported selections round-trip without sharing mutable objects", () => {
	const saved = getDefaultMods();
	const serialized = JSON.stringify(saved);
	const restored = validateMods(JSON.parse(serialized));
	expect(restored).toEqual(saved);
	restored["nba-cup"]!.enabled = false;
	expect(saved["nba-cup"]!.enabled).toBe(true);
});

test("reject unavailable, incompatible, malformed, and wrong-version enabled mods", () => {
	expect(() =>
		validateMods({ other: { enabled: true, version: "1.0.0" } }),
	).toThrow("not installed");
	expect(() => validateMods(getDefaultMods(), "football")).toThrow(
		"unavailable",
	);
	expect(() =>
		validateMods({ "nba-cup": { enabled: true, version: "99" } }),
	).toThrow("requires version");
	for (const input of [
		null,
		[],
		{ "nba-cup": true },
		{ "nba-cup": { enabled: "yes", version: "1" } },
	]) {
		expect(() => validateMods(input)).toThrow();
	}
});

test("validate dependency and conflict rules before activation", () => {
	const base = modRegistry.find((mod) => mod.id === "nba-cup")!;
	const dependency = {
		...base,
		id: "dependency",
		dependencies: [],
		conflicts: [],
	};
	const dependent = { ...base, dependencies: ["dependency"] };
	const config: ReturnType<typeof getDefaultMods> = {
		[base.id]: { enabled: true, version: base.version },
	};
	expect(() =>
		validateMods(config, "basketball", [dependent, dependency]),
	).toThrow("requires dependency");
	config.dependency = { enabled: true, version: base.version };
	expect(validateMods(config, "basketball", [dependent, dependency])).toEqual(
		config,
	);
	expect(() =>
		validateMods(config, "basketball", [
			{ ...dependent, conflicts: ["dependency"] },
			dependency,
		]),
	).toThrow("conflicts");
});

test("imports preserve saved selections while new leagues use chosen settings before defaults", () => {
	const enabled = getDefaultMods();
	const disabled = { "nba-cup": { enabled: false, version: "1.0.0" } };
	expect(
		resolveModsForNewLeague({
			importedAttributes: { mods: disabled },
			selection: enabled,
			defaults: enabled,
		}),
	).toEqual(disabled);
	expect(
		resolveModsForNewLeague({
			importedAttributes: {},
			selection: disabled,
			defaults: disabled,
		}),
	).toEqual(enabled);
	expect(
		resolveModsForNewLeague({ selection: disabled, defaults: enabled }),
	).toEqual(disabled);
	expect(resolveModsForNewLeague({ defaults: disabled })).toEqual(disabled);
});
