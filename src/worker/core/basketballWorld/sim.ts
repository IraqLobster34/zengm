import {
	emptyWorldStats,
	type WorldBoxScore,
	type WorldCompetition,
} from "../../../common/basketballWorld.ts";
import type { Player } from "../../../common/types.ts";

const rating = (p: Player, key: string) =>
	(p.ratings.at(-1)! as unknown as Record<string, number>)[key] ?? 30;
const choose = <T>(
	items: T[],
	weight: (item: T) => number,
	random: () => number,
): T => {
	const sum = items.reduce(
		(total, item) => total + Math.max(1, weight(item)),
		0,
	);
	let value = random() * sum;
	return (
		items.find((item) => {
			value -= Math.max(1, weight(item));
			return value < 0;
		}) ?? items.at(-1)!
	);
};

// Secondary competitions have separate box scores: no NBA statistics or records
// are changed by a college/G League game.
export const simulateWorldGame = (
	home: Player[],
	away: Player[],
	competition: WorldCompetition,
	neutral = false,
	random = Math.random,
) => {
	const college = competition === "college";
	const foulLimit = college ? 5 : 6;
	const rotations = [home, away].map((roster) => {
		const healthy = roster.filter(
			(p) =>
				p.injury.gamesRemaining <= 0 &&
				!(college && p.basketballPathway?.redshirt),
		);
		const pool = healthy.length >= 5 ? healthy : roster;
		return [...pool]
			.sort((a, b) => rating(b, "ovr") - rating(a, "ovr"))
			.slice(0, 10);
	});
	if (rotations.some((roster) => roster.length < 5)) {
		throw new Error("A world team needs at least five available players.");
	}
	const boxes = rotations.map((roster) =>
		roster.map((p): WorldBoxScore => ({
			...emptyWorldStats(),
			gp: 1,
			pid: p.pid,
			name: `${p.firstName} ${p.lastName}`,
		})),
	);
	const scores: [number, number] = [0, 0];
	const periods = college ? 2 : 4;
	let overtimes = 0;
	const playPeriod = (period: number, overtime: boolean) => {
		const fouls = [0, 0];
		const possessions = overtime
			? 9
			: Math.round((college ? 34 : 25) + random() * 6 - 3);
		for (let possession = 0; possession < possessions; possession++) {
			for (const side of [0, 1] as const) {
				const other = side === 0 ? 1 : 0;
				const eligible = rotations[side]!.filter(
					(_, i) => boxes[side]![i]!.pf < foulLimit,
				);
				const attackers = eligible.length >= 5 ? eligible : rotations[side]!;
				const opponents = rotations[other]!;
				const shooter = choose(
					attackers,
					(p) => 20 + rating(p, "oiq") + rating(p, "fg") + rating(p, "tp"),
					random,
				);
				const defender = choose(
					opponents,
					(p) => 50 + rating(p, "diq"),
					random,
				);
				const shot = boxes[side]!.find((p) => p.pid === shooter.pid)!;
				const defense = boxes[other]!.find((p) => p.pid === defender.pid)!;
				if (
					random() <
					0.14 + (rating(defender, "diq") - rating(shooter, "drb")) / 900
				) {
					shot.tov++;
					if (random() < 0.55) {
						defense.stl++;
					}
					continue;
				}
				const three = random() < 0.36 + (rating(shooter, "tp") - 40) / 400;
				const value = three ? 3 : 2;
				const shootingFoul = random() < (three ? 0.035 : 0.12);
				const nonShootingFoul = !shootingFoul && random() < 0.045;
				if (shootingFoul || nonShootingFoul) {
					defense.pf++;
					fouls[other]!++;
				}
				const bonus = college ? fouls[other]! >= 7 : fouls[other]! >= 5;
				if (shootingFoul || (nonShootingFoul && bonus)) {
					const shots = shootingFoul ? value : 2;
					const oneAndOne = college && nonShootingFoul && fouls[other]! < 10;
					const singleFreeThrow =
						!college && !overtime && possession < possessions - 4;
					for (let ft = 0; ft < (singleFreeThrow ? 1 : shots); ft++) {
						shot.fta++;
						if (random() < 0.5 + rating(shooter, "ft") / 250) {
							shot.ft++;
							shot.pts += singleFreeThrow ? shots : 1;
							scores[side] += singleFreeThrow ? shots : 1;
						} else if (ft === 0 && oneAndOne) {
							break;
						}
					}
					continue;
				}
				shot.fga++;
				if (three) {
					shot.tpa++;
				}
				const chance =
					(three
						? 0.22 + rating(shooter, "tp") / 430
						: 0.36 + rating(shooter, "fg") / 320) +
					(side === 0 && !neutral ? 0.025 : 0) -
					rating(defender, "diq") / 1100;
				if (random() < chance) {
					shot.fg++;
					if (three) {
						shot.tp++;
					}
					shot.pts += value;
					scores[side] += value;
					if (random() < 0.58) {
						const passer = choose(
							attackers.filter((p) => p.pid !== shooter.pid),
							(p) => rating(p, "pss"),
							random,
						);
						boxes[side]!.find((p) => p.pid === passer.pid)!.ast++;
					}
				} else {
					if (random() < 0.08) {
						defense.blk++;
					}
					const rebSide = random() < 0.24 ? side : other;
					const rebounder = choose(
						rotations[rebSide]!,
						(p) => rating(p, "reb") + rating(p, "hgt"),
						random,
					);
					boxes[rebSide]!.find((p) => p.pid === rebounder.pid)!.reb++;
				}
			}
		}
		void period;
	};
	for (let period = 0; period < periods; period++) {
		playPeriod(period, false);
	}
	while (scores[0] === scores[1]) {
		playPeriod(periods + overtimes, true);
		overtimes++;
		if (overtimes > 10) {
			scores[0]++;
			boxes[0]![0]!.pts++;
			boxes[0]![0]!.ft++;
			boxes[0]![0]!.fta++;
		}
	}
	const minutes = ((college ? 40 : 48) + overtimes * 5) * 5;
	for (const box of boxes) {
		const weights = box.map((_, i) => Math.max(5, 35 - i * 3));
		const total = weights.reduce((a, b) => a + b, 0);
		box.forEach((p, i) => {
			p.min = (minutes * weights[i]!) / total;
		});
	}
	return {
		pts: scores,
		box: boxes as [WorldBoxScore[], WorldBoxScore[]],
		overtimes,
	};
};
