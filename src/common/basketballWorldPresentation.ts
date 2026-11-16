import type {
	BasketballWorld,
	WorldCompetition,
	WorldGame,
	WorldTeam,
	WorldTournament,
} from "./basketballWorld.ts";

export const buildWorldStandings = (
	teams: WorldTeam[],
	games: WorldGame[],
	competition: WorldCompetition,
) => {
	const records = new Map(
		teams.map((team) => [
			team.id,
			{
				...team,
				won: 0,
				lost: 0,
				confWon: 0,
				confLost: 0,
				pf: 0,
				pa: 0,
				homeWon: 0,
				homeLost: 0,
				awayWon: 0,
				awayLost: 0,
				results: [] as boolean[],
			},
		]),
	);
	for (const game of [...games].sort((a, b) => a.day - b.day || a.id - b.id)) {
		if (
			!game.pts ||
			game.competition !== competition ||
			game.stage !== "regular"
		) {
			continue;
		}
		for (const side of [0, 1] as const) {
			const t = records.get(side === 0 ? game.home : game.away);
			if (!t) {
				continue;
			}
			const win = game.pts[side] > game.pts[side === 0 ? 1 : 0];
			if (win) {
				t.won++;
			} else {
				t.lost++;
			}
			t.pf += game.pts[side];
			t.pa += game.pts[side === 0 ? 1 : 0];
			t.results.push(win);
			if (game.conferenceGame) {
				if (win) {
					t.confWon++;
				} else {
					t.confLost++;
				}
			}
			if (!game.neutral) {
				if (side === 0) {
					if (win) {
						t.homeWon++;
					} else {
						t.homeLost++;
					}
				} else {
					if (win) {
						t.awayWon++;
					} else {
						t.awayLost++;
					}
				}
			}
		}
	}
	const pct = (won: number, lost: number) => won / Math.max(1, won + lost);
	const compare = (
		a: typeof records extends Map<number, infer T> ? T : never,
		b: typeof a,
	) =>
		pct(b.won, b.lost) - pct(a.won, a.lost) ||
		(b.pf - b.pa) / Math.max(1, b.won + b.lost) -
			(a.pf - a.pa) / Math.max(1, a.won + a.lost) ||
		a.id - b.id;
	const overall = [...records.values()].sort(compare);
	const groups = new Map<string, typeof overall>();
	for (const t of overall) {
		const list = groups.get(t.conference) ?? [];
		list.push(t);
		groups.set(t.conference, list);
	}
	for (const group of groups.values()) {
		group.sort(
			(a, b) =>
				(competition === "college"
					? pct(b.confWon, b.confLost) - pct(a.confWon, a.confLost)
					: 0) || compare(a, b),
		);
	}
	return overall.map((t, i) => {
		const group = groups.get(t.conference)!;
		const leader = group[0]!;
		const gp = t.won + t.lost;
		const recent = t.results.slice(-10);
		const last = t.results.at(-1);
		let streak = 0;
		for (let n = t.results.length - 1; n >= 0 && t.results[n] === last; n--) {
			streak++;
		}
		const leagueGames = competition === "college";
		const gb =
			((leagueGames ? leader.confWon : leader.won) -
				(leagueGames ? t.confWon : t.won) +
				(leagueGames ? t.confLost : t.lost) -
				(leagueGames ? leader.confLost : leader.lost)) /
			2;
		const { results, ...team } = t;
		void results;
		return {
			...team,
			rank: i + 1,
			conferenceRank: group.findIndex((row) => row.id === t.id) + 1,
			gp,
			pct: pct(t.won, t.lost),
			conferencePct: pct(t.confWon, t.confLost),
			gb,
			ppg: t.pf / Math.max(1, gp),
			oppg: t.pa / Math.max(1, gp),
			diff: (t.pf - t.pa) / Math.max(1, gp),
			last10: `${recent.filter(Boolean).length}–${recent.filter((win) => !win).length}`,
			streak: last === undefined ? "—" : `${last ? "W" : "L"}${streak}`,
		};
	});
};

const roundName = (size: number) =>
	size > 64
		? "Opening round"
		: size === 2
			? "Championship"
			: size === 4
				? "Semifinals"
				: size === 8
					? "Quarterfinals"
					: `Round of ${size}`;
export const buildWorldBracket = (
	world: BasketballWorld,
	tournament: WorldTournament,
) => {
	const belongs = (game: WorldGame) => {
		if (
			game.competition !== tournament.competition ||
			game.stage !== tournament.stage
		) {
			return false;
		}
		if (game.tournament) {
			return game.tournament === tournament.name;
		}
		// Pre-bracket saves did not persist tournament IDs or seeds.
		return (
			tournament.stage !== "conference" ||
			world.schools.some(
				(t) => t.id === game.home && t.conference === tournament.name,
			)
		);
	};
	const games = world.games
		.filter(belongs)
		.sort((a, b) => a.day - b.day || a.id - b.id);
	const participants = tournament.seeds ?? [
		...new Set([
			...games.flatMap((g) => [g.home, g.away]),
			...tournament.teams,
		]),
	];
	const seeded = tournament.seeds !== undefined;
	const days = [...new Set(games.map((g) => g.day))];
	let remaining = [...participants];
	const rounds = [];
	let size = participants.length;
	for (let round = 0; size > 1; round++) {
		const day = days[round];
		const matchups =
			day === undefined ? [] : games.filter((g) => g.day === day);
		const bracketSize = 2 ** Math.floor(Math.log2(size - 1));
		const count = size - bracketSize;
		const playing = new Set(matchups.flatMap((g) => [g.home, g.away]));
		const byes =
			matchups.length > 0 ? remaining.filter((id) => !playing.has(id)) : [];
		rounds.push({
			name: roundName(size),
			day,
			byes,
			pending: Math.max(0, count - matchups.length),
			games: matchups.map(({ id, home, away, pts, overtimes }) => ({
				id,
				home,
				away,
				pts,
				overtimes,
				homeSeed: seeded ? participants.indexOf(home) + 1 : undefined,
				awaySeed: seeded ? participants.indexOf(away) + 1 : undefined,
			})),
		});
		const losers = new Set(
			matchups
				.filter((g) => g.pts)
				.map((g) => (g.pts![0] > g.pts![1] ? g.away : g.home)),
		);
		remaining = remaining.filter((id) => !losers.has(id));
		size = bracketSize;
	}
	return {
		name: tournament.name,
		competition: tournament.competition,
		stage: tournament.stage,
		champion: tournament.champion,
		entrants: participants.length,
		remaining: tournament.teams.length,
		rounds,
	};
};
