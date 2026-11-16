export type ModConfiguration = Record<
	string,
	{ enabled: boolean; version: string }
>;

export type ModDefinition = {
	id: string;
	name: string;
	version: string;
	description: string;
	sports: string[];
	dependencies: string[];
	conflicts: string[];
	defaultEnabled: boolean;
	requirements: string;
	page?: { id: string; path: string; name: string };
};

// Bundled mods only. A manifest never loads or executes external code.
export const modRegistry: ModDefinition[] = [
	{
		id: "basketball-world",
		name: "Connected Basketball",
		version: "1.0.0",
		description:
			"College basketball, the NBA draft, and G League development in one saved world. Real schools and generated players.",
		sports: ["basketball"],
		dependencies: [],
		conflicts: [],
		defaultEnabled: false,
		requirements:
			"Basketball, an NBA-style draft, and historical roster forcing and repeat-season modes turned off.",
		page: {
			id: "basketballWorld",
			path: "basketball_world",
			name: "College & G League",
		},
	},
	{
		id: "nba-cup",
		name: "NBA Cup",
		version: "1.0.0",
		description:
			"Add group play, a knockout bracket, a Cup MVP, and lasting team and player honors to the regular season.",
		sports: ["basketball"],
		dependencies: [],
		conflicts: [],
		defaultEnabled: true,
		requirements:
			"30 active teams, two conferences of 15, and 82 regular-season games.",
		page: { id: "nbaCup", path: "nba_cup", name: "NBA Cup" },
	},
];

export const getDefaultMods = (sport = __SPORT): ModConfiguration =>
	Object.fromEntries(
		modRegistry.map((mod) => [
			mod.id,
			{
				enabled: mod.defaultEnabled && mod.sports.includes(sport),
				version: mod.version,
			},
		]),
	);

// Missing configuration means a pre-connector save: preserve its behavior.
export const isModEnabled = (
	configuration: ModConfiguration | undefined,
	id: string,
	sport = __SPORT,
) => {
	const mod = modRegistry.find((entry) => entry.id === id);
	return (
		!!mod &&
		mod.sports.includes(sport) &&
		(configuration === undefined
			? mod.defaultEnabled
			: configuration[id]?.enabled === true)
	);
};

export const validateMods = (
	configuration: unknown,
	sport = __SPORT,
	registry = modRegistry,
): ModConfiguration => {
	if (
		!configuration ||
		typeof configuration !== "object" ||
		Array.isArray(configuration)
	) {
		throw new Error("Invalid mod selection. Choose your mods again.");
	}
	const result: ModConfiguration = {};
	for (const [id, value] of Object.entries(configuration)) {
		if (
			!value ||
			typeof value !== "object" ||
			!("enabled" in value) ||
			typeof value.enabled !== "boolean" ||
			!("version" in value) ||
			typeof value.version !== "string"
		) {
			throw new Error(`Invalid settings for mod ${id}.`);
		}
		const mod = registry.find((entry) => entry.id === id);
		if (value.enabled) {
			if (!mod) {
				throw new Error(`Required mod ${id} is not installed.`);
			}
			if (!mod.sports.includes(sport)) {
				throw new Error(`${mod.name} is unavailable for ${sport}.`);
			}
			if (value.version !== mod.version) {
				throw new Error(
					`${mod.name} requires version ${value.version}; installed version is ${mod.version}.`,
				);
			}
		}
		if (id === "__proto__" || id === "constructor" || id === "prototype") {
			throw new Error("Invalid mod ID.");
		}
		result[id] = { enabled: value.enabled, version: value.version };
	}
	for (const mod of registry) {
		if (!result[mod.id]?.enabled) {
			continue;
		}
		for (const id of mod.dependencies) {
			if (!result[id]?.enabled) {
				throw new Error(`${mod.name} requires ${id}.`);
			}
		}
		for (const id of mod.conflicts) {
			if (result[id]?.enabled) {
				throw new Error(`${mod.name} conflicts with ${id}.`);
			}
		}
	}
	return result;
};

// Imported game attributes own their configuration, including the legacy fallback.
export const resolveModsForNewLeague = ({
	importedAttributes,
	selection,
	defaults,
}: {
	importedAttributes?: { mods?: unknown };
	selection?: ModConfiguration;
	defaults?: ModConfiguration;
}) =>
	validateMods(
		importedAttributes
			? (importedAttributes.mods ?? getDefaultMods())
			: (selection ?? defaults ?? getDefaultMods()),
	);
