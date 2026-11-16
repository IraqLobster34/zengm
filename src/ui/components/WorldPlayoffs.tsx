import { useState } from "react";
import clsx from "clsx";
import type { View } from "../../common/types.ts";
import { helpers } from "../util/helpers.ts";

type Props = Pick<
	View<"basketballWorld">,
	"brackets" | "schools" | "affiliates"
>;
const WorldBracket = ({
	bracket,
	schools,
	affiliates,
}: Props & { bracket: Props["brackets"][number] }) => {
	const activeRound = Math.max(
		0,
		bracket.rounds.findLastIndex((round) => round.games.length > 0),
	);
	const [selectedRound, setSelectedRound] = useState(activeRound);
	const teams = bracket.competition === "college" ? schools : affiliates;
	const name = (id: number) =>
		teams.find((t) => t.id === id)?.name ?? "Unknown team";
	const teamUrl = (id: number) =>
		helpers.leagueUrl([
			"basketball_world",
			bracket.competition === "college" ? "college" : "g_league",
			id,
		]);
	return (
		<>
			<div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
				<div>
					<h2 className="h4 mb-1">{bracket.name}</h2>
					<p className="text-body-secondary mb-0">
						{bracket.entrants} teams ·{" "}
						{bracket.champion !== undefined
							? "Tournament complete"
							: `${bracket.remaining} remaining`}
					</p>
				</div>
				{bracket.champion !== undefined ? (
					<div className="world-champion">
						<span className="text-body-secondary d-block small">Champions</span>
						<a className="fw-bold" href={teamUrl(bracket.champion)}>
							{name(bracket.champion)}
						</a>
					</div>
				) : null}
			</div>
			<label className="d-sm-none form-label" htmlFor="world-round">
				Round
			</label>
			<select
				id="world-round"
				className="d-sm-none form-select mb-3"
				value={selectedRound}
				onChange={(event) => setSelectedRound(Number(event.target.value))}
			>
				{bracket.rounds.map((round, i) => (
					<option key={i} value={i}>
						{round.name}
					</option>
				))}
			</select>
			<div className="world-bracket" aria-label={`${bracket.name} bracket`}>
				{bracket.rounds.map((round, index) => (
					<section
						key={index}
						className={clsx("world-bracket-round", {
							"is-selected": index === selectedRound,
						})}
						aria-label={round.name}
					>
						<h3 className="h6 border-bottom pb-2 mb-3">
							{round.name}
							{round.day !== undefined ? (
								<span className="d-block fw-normal text-body-secondary small mt-1">
									Day {round.day}
								</span>
							) : null}
						</h3>
						<div className="world-bracket-matches">
							{round.games.map((game) => (
								<div key={game.id} className="world-matchup">
									{([0, 1] as const).map((side) => {
										const id = side === 0 ? game.home : game.away;
										const winner =
											game.pts !== undefined &&
											game.pts[side] > game.pts[side === 0 ? 1 : 0];
										const seed = side === 0 ? game.homeSeed : game.awaySeed;
										return (
											<div
												key={side}
												className={clsx("world-matchup-team", {
													"fw-bold": winner,
													"text-body-secondary":
														game.pts !== undefined && !winner,
												})}
											>
												<span className="world-seed">{seed ?? ""}</span>
												<a href={teamUrl(id)}>{name(id)}</a>
												<span className="world-score">
													{game.pts?.[side] ?? "—"}
												</span>
											</div>
										);
									})}
									<div className="world-matchup-footer">
										{game.pts ? (
											<a
												href={helpers.leagueUrl([
													"basketball_world",
													"game",
													game.id,
												])}
											>
												Box score
												{game.overtimes
													? ` · ${game.overtimes > 1 ? game.overtimes : ""}OT`
													: ""}
											</a>
										) : (
											"Scheduled"
										)}
									</div>
								</div>
							))}
							{Array.from({ length: round.pending }, (_, i) => (
								<div
									className="world-matchup text-body-secondary py-3 px-2"
									key={`pending-${i}`}
								>
									Winner from previous round
									<br />
									<span className="small">Matchup to be determined</span>
								</div>
							))}
						</div>
						{round.byes.length > 0 ? (
							<details className="small mt-2">
								<summary>{round.byes.length} teams receive a bye</summary>
								<ul className="ps-3 mt-1">
									{round.byes.map((id) => (
										<li key={id}>
											<a href={teamUrl(id)}>{name(id)}</a>
										</li>
									))}
								</ul>
							</details>
						) : null}
					</section>
				))}
			</div>
		</>
	);
};

export const WorldPlayoffs = (props: Props) => {
	const [stage, setStage] = useState("national");
	const [conference, setConference] = useState("");
	const choices = props.brackets.filter((t) => t.stage === stage);
	const selected = choices.find((t) => t.name === conference) ?? choices[0];
	return (
		<>
			<div className="d-flex flex-wrap gap-3 mb-4">
				<div>
					<label className="form-label" htmlFor="world-tournament">
						Tournament
					</label>
					<select
						id="world-tournament"
						className="form-select"
						value={stage}
						onChange={(event) => setStage(event.target.value)}
					>
						<option value="national">College national championship</option>
						<option value="conference">Conference tournaments</option>
						<option value="nit">NIT</option>
						<option value="playoffs">G League playoffs</option>
					</select>
				</div>
				{stage === "conference" && choices.length > 0 ? (
					<div>
						<label className="form-label" htmlFor="world-playoff-conference">
							Conference
						</label>
						<select
							id="world-playoff-conference"
							className="form-select"
							value={selected?.name ?? ""}
							onChange={(event) => setConference(event.target.value)}
						>
							{choices.map((t) => (
								<option key={t.name}>{t.name}</option>
							))}
						</select>
					</div>
				) : null}
			</div>
			{selected ? (
				<WorldBracket
					key={`${selected.name}-${selected.rounds.length}`}
					{...props}
					bracket={selected}
				/>
			) : (
				<div className="border rounded p-4">
					<h2 className="h5">The bracket is not set yet</h2>
					<p className="mb-0 text-body-secondary">
						{stage === "national"
							? "The national field is selected after conference tournaments finish."
							: stage === "conference"
								? "Conference tournaments begin after the college regular season."
								: stage === "playoffs"
									? "The G League playoff field is set after its regular season."
									: "The NIT field is selected alongside the national championship."}{" "}
						Continue playing the NBA season to advance these competitions.
					</p>
				</div>
			)}
		</>
	);
};
