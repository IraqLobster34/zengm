export const WORLD_TIDS = { college: -9, gLeague: -10, recruit: -11 } as const;
export type WorldCompetition = "college" | "gLeague";
export type WorldStats = {
	gp: number;
	min: number;
	pts: number;
	fg: number;
	fga: number;
	tp: number;
	tpa: number;
	ft: number;
	fta: number;
	reb: number;
	ast: number;
	stl: number;
	blk: number;
	tov: number;
	pf: number;
};
export const emptyWorldStats = (): WorldStats => ({
	gp: 0,
	min: 0,
	pts: 0,
	fg: 0,
	fga: 0,
	tp: 0,
	tpa: 0,
	ft: 0,
	fta: 0,
	reb: 0,
	ast: 0,
	stl: 0,
	blk: 0,
	tov: 0,
	pf: 0,
});
export type PathwaySeason = WorldStats & {
	season: number;
	competition: WorldCompetition;
	teamId: number;
	team: string;
};
export type BasketballPathway = {
	status: "college" | "recruit" | "portal" | "draft" | "gLeague" | "nba";
	schoolId?: number;
	affiliateId?: number;
	assigned?: boolean;
	enrolled: number;
	highSchoolYear: number;
	seasonsPlayed: number;
	gpa: number;
	redshirt: boolean;
	nil: number;
	interest: Record<number, number>;
	history: PathwaySeason[];
};
export type WorldTeam = {
	id: number;
	name: string;
	abbrev: string;
	conference: string;
	prestige: number;
	budget: number;
	spent: number;
	won: number;
	lost: number;
	confWon: number;
	confLost: number;
	pf: number;
	pa: number;
	coach: string;
	coaching: number;
	parentTid?: number;
};
export type WorldBoxScore = WorldStats & { pid: number; name: string };
export type WorldGame = {
	id: number;
	day: number;
	competition: WorldCompetition;
	home: number;
	away: number;
	stage: "regular" | "conference" | "national" | "nit" | "playoffs";
	conferenceGame?: boolean;
	neutral?: boolean;
	pts?: [number, number];
	box?: [WorldBoxScore[], WorldBoxScore[]];
	overtimes?: number;
};
export type WorldTournament = {
	name: string;
	competition: WorldCompetition;
	stage: WorldGame["stage"];
	teams: number[];
	round: number;
	day: number;
	champion?: number;
};
export type WorldArchive = {
	season: number;
	collegeChampion?: string;
	gLeagueChampion?: string;
	nitChampion?: string;
	draftPids: number[];
	collegeStandings: { name: string; won: number; lost: number }[];
};
export type BasketballWorld = {
	initializing?: boolean;
	version: 1;
	rules: string;
	season: number;
	day: number;
	stage: "regular" | "postseason" | "offseason";
	schools: WorldTeam[];
	affiliates: WorldTeam[];
	games: WorldGame[];
	tournaments: WorldTournament[];
	userSchoolId: number;
	recruitingPoints: number;
	draftPrepared: boolean;
	offseasonProcessed: boolean;
	archives: WorldArchive[];
	news: string[];
};

export const collegeEligibility = (p: BasketballPathway, season: number) => {
	// Transitional cohort uses four seasons in five years; fall 2027 entrants
	// use the five-year model. Individual waivers are outside this model.
	const seasonsAllowed = p.enrolled >= 2027 ? 5 : 4;
	const clockLeft = Math.max(0, 5 - (season - p.enrolled));
	return {
		eligible: clockLeft > 0 && p.seasonsPlayed < seasonsAllowed && p.gpa >= 2,
		remaining: Math.max(
			0,
			Math.min(clockLeft, seasonsAllowed - p.seasonsPlayed),
		),
	};
};
export const nbaDraftEligible = (
	bornYear: number,
	highSchoolYear: number,
	season: number,
) => season - bornYear >= 19 && season > highSchoolYear;

export const rankWorldTeams = (teams: WorldTeam[]) =>
	[...teams].sort(
		(a, b) =>
			b.won / Math.max(1, b.won + b.lost) -
				a.won / Math.max(1, a.won + a.lost) ||
			(b.pf - b.pa) / Math.max(1, b.won + b.lost) -
				(a.pf - a.pa) / Math.max(1, a.won + a.lost) ||
			a.id - b.id,
	);

export const roundRobin = (
	ids: number[],
	rounds: number,
): [number, number][][] => {
	const rotation = [...ids];
	if (rotation.length % 2 !== 0) {
		rotation.push(-1);
	}
	if (rotation.length < 2) {
		return [];
	}
	const output: [number, number][][] = [];
	for (let round = 0; round < rounds; round++) {
		const pairs: [number, number][] = [];
		for (let i = 0; i < rotation.length / 2; i++) {
			const a = rotation[i]!;
			const b = rotation[rotation.length - 1 - i]!;
			if (a !== -1 && b !== -1) {
				pairs.push(round % 2 ? [a, b] : [b, a]);
			}
		}
		output.push(pairs);
		rotation.splice(1, 0, rotation.pop()!);
	}
	return output;
};
