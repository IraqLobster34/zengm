export type CupStage = "group" | "quarterfinal" | "semifinal" | "final";

export type CupGame = {
	gid: number;
	day: number;
	homeTid: number;
	awayTid: number;
	stage: CupStage;
	pts?: [number, number];
};

export type NbaCup = {
	season: number;
	groups: { cid: number; tids: number[] }[];
	games: CupGame[];
	stage: CupStage | "complete";
	knockoutDay: number;
	nextGid: number;
	seeds?: number[][];
	champion?: number;
	mvp?: { pid: number; tid: number; name: string };
	awardsGranted?: boolean;
	// Optional for Cups saved before seeded draws were introduced.
	draw?: {
		previousSeason: number;
		pots: { cid: number; tids: number[][] }[];
		unseededTids: number[];
	};
};

export const cupStageName = (stage: CupStage | "complete") =>
	({
		group: "Group play",
		quarterfinal: "Quarterfinals",
		semifinal: "Semifinals",
		final: "Championship",
		complete: "Complete",
	})[stage];

export const cupStandings = (cup: NbaCup, tids: number[]) => {
	const rows = tids.map((tid) => {
		let won = 0;
		let lost = 0;
		let diff = 0;
		let pts = 0;
		for (const game of cup.games) {
			if (game.stage !== "group" || !game.pts) {
				continue;
			}
			const i = game.homeTid === tid ? 0 : game.awayTid === tid ? 1 : undefined;
			if (i === undefined) {
				continue;
			}
			const score = game.pts[i];
			const other = game.pts[i === 0 ? 1 : 0];
			won += Number(score > other);
			lost += Number(score < other);
			diff += score - other;
			pts += score;
		}
		return { tid, won, lost, diff, pts };
	});
	// Resolve tied records as a group: head-to-head only for a two-team tie.
	// A deterministic draw (the shuffled group order) is the final fallback.
	return rows.sort((a, b) => {
		if (a.won !== b.won) {
			return b.won - a.won;
		}
		const tied = rows.filter((row) => row.won === a.won);
		if (tied.length === 2) {
			const head = cup.games.find(
				(game) =>
					game.stage === "group" &&
					game.pts &&
					((game.homeTid === a.tid && game.awayTid === b.tid) ||
						(game.homeTid === b.tid && game.awayTid === a.tid)),
			);
			if (head?.pts && head.pts[0] !== head.pts[1]) {
				const winner = head.pts[0] > head.pts[1] ? head.homeTid : head.awayTid;
				return winner === a.tid ? -1 : 1;
			}
		}
		return (
			b.diff - a.diff ||
			b.pts - a.pts ||
			tids.indexOf(a.tid) - tids.indexOf(b.tid)
		);
	});
};

export const cupQualifiers = (cup: NbaCup) => {
	const cids = [...new Set(cup.groups.map((group) => group.cid))];
	return cids.map((cid) => {
		const groups = cup.groups.filter((group) => group.cid === cid);
		const winners = groups.map(
			(group) => cupStandings(cup, group.tids)[0]!.tid,
		);
		const others = groups
			.flatMap((group) => group.tids)
			.filter((tid) => !winners.includes(tid));
		// No head-to-head comparison between different groups.
		// Calculate records from all group games, then sort without head-to-head.
		const all = cupStandings(
			cup,
			groups.flatMap((group) => group.tids),
		);
		all.sort(
			(a, b) =>
				b.won - a.won || b.diff - a.diff || b.pts - a.pts || a.tid - b.tid,
		);
		const wildcard = all.find((row) => others.includes(row.tid))!.tid;
		return [
			...winners.sort(
				(a, b) =>
					all.findIndex((row) => row.tid === a) -
					all.findIndex((row) => row.tid === b),
			),
			wildcard,
		];
	});
};
