import { useState } from "react";
import type { View, Col } from "../../common/types.ts";
import {
	DataTable,
	type DataTableRow,
} from "../components/DataTable/index.tsx";
import { WorldPlayoffs } from "../components/WorldPlayoffs.tsx";
import useTitleBar from "../hooks/useTitleBar.tsx";
import { helpers } from "../util/helpers.ts";

type Props = View<"basketballWorld">;
const url = (section: string, id?: number) =>
	helpers.leagueUrl(
		id === undefined
			? ["basketball_world", section]
			: ["basketball_world", section, id],
	);
const numeric = (title: string, desc?: string): Col => ({
	title,
	desc,
	sortType: "number",
	sortSequence: ["desc", "asc"],
});
const fixed = (value: number, digits = 1) => ({
	value: value.toFixed(digits),
	sortValue: value,
	searchValue: value.toFixed(digits),
});

const WorldStandings = ({ props }: { props: Props }) => {
	const [conference, setConference] = useState("");
	const [scope, setScope] = useState("all");
	const college = props.section === "college";
	const standings = college ? props.collegeStandings : props.gLeagueStandings;
	const selected = standings.filter(
		(t) =>
			(!conference || t.conference === conference) &&
			(!college || scope !== "top25" || props.rankings.indexOf(t.id) < 25),
	);
	const cols: Col[] = [
		numeric("#", "Rank within the selected standings"),
		{ title: "Team" },
		{ title: college ? "Conference" : "NBA affiliate" },
		numeric("GP"),
		numeric("W"),
		numeric("L"),
		numeric("PCT", "Regular-season winning percentage"),
		numeric(
			"GB",
			college
				? "Games behind the conference leader, using conference games"
				: "Games behind the conference leader",
		),
		...(college
			? [
					{
						title: "Conf",
						desc: "Conference wins and losses",
						sortType: "number",
					} satisfies Col,
				]
			: []),
		{ title: "Home" },
		{ title: "Away" },
		{ title: "L10" },
		{ title: "Streak" },
		numeric("PPG"),
		numeric("OPPG", "Opponent points per game"),
		numeric("DIFF", "Average point differential"),
	];
	const rows: DataTableRow[] = selected.map((t) => {
		const field = props.brackets.find(
			(b) => b.stage === (college ? "national" : "playoffs"),
		);
		const qualified =
			field?.rounds.some(
				(round) =>
					round.byes.includes(t.id) ||
					round.games.some((game) => game.home === t.id || game.away === t.id),
			) || field?.champion === t.id;
		const champion = props.brackets.some(
			(b) => b.stage === "conference" && b.champion === t.id,
		);
		const rank = conference
			? t.conferenceRank
			: college && scope === "top25"
				? props.rankings.indexOf(t.id) + 1
				: t.rank;
		const parent = !college
			? props.affiliates.find((a) => a.id === t.id)?.parent
			: undefined;
		return {
			key: t.id,
			data: [
				rank,
				{
					value: (
						<>
							<a href={url(props.section, t.id)}>{t.name}</a>
							{champion ? (
								<span className="badge text-bg-success ms-2">AQ</span>
							) : qualified ? (
								<span className="badge text-bg-secondary ms-2">Qualified</span>
							) : null}
						</>
					),
					sortValue: t.name,
					searchValue: `${t.name} ${t.abbrev}`,
				},
				college ? t.conference : (parent ?? "Independent"),
				t.gp,
				t.won,
				t.lost,
				fixed(t.pct, 3),
				{ value: t.gp && t.gb !== 0 ? t.gb.toFixed(1) : "—", sortValue: t.gb },
				...(college
					? [
							{
								value: `${t.confWon}–${t.confLost}`,
								sortValue: t.conferencePct,
							},
						]
					: []),
				`${t.homeWon}–${t.homeLost}`,
				`${t.awayWon}–${t.awayLost}`,
				t.last10,
				t.streak,
				t.gp ? fixed(t.ppg) : "—",
				t.gp ? fixed(t.oppg) : "—",
				t.gp ? fixed(t.diff) : "—",
			],
		};
	});
	return (
		<>
			<div className="d-flex flex-wrap gap-3 align-items-end mb-3">
				<div>
					<label htmlFor="world-conference" className="form-label">
						Conference
					</label>
					<select
						id="world-conference"
						className="form-select"
						value={conference}
						onChange={(event) => setConference(event.target.value)}
					>
						<option value="">All conferences</option>
						{[...new Set(standings.map((t) => t.conference))]
							.sort()
							.map((name) => (
								<option key={name}>{name}</option>
							))}
					</select>
				</div>
				{college ? (
					<div>
						<label htmlFor="world-ranking" className="form-label">
							Standings
						</label>
						<select
							id="world-ranking"
							className="form-select"
							value={scope}
							onChange={(event) => setScope(event.target.value)}
						>
							<option value="all">All teams</option>
							<option value="top25">Model top 25</option>
						</select>
					</div>
				) : null}
			</div>
			<p className="small text-body-secondary">
				Regular-season records only.{" "}
				{conference
					? "Teams are ranked within their conference."
					: "Use a conference filter to compare conference positions."}{" "}
				Select a team to see its roster and results.{" "}
				{college ? "AQ = conference tournament champion." : ""}
			</p>
			<DataTable
				name={`Connected ${college ? "College" : "G League"} Standings ${conference || "all"} ${scope}`}
				cols={cols}
				rows={rows}
				defaultSort={[0, "asc"]}
				defaultStickyCols={2}
				pagination
			/>
			{college && scope === "top25" ? (
				<p className="small text-body-secondary">
					Model rankings consider record, opponent strength, and scoring margin.
					They are not official polls or the NCAA NET.
				</p>
			) : null}
		</>
	);
};

const PlayerTable = ({
	people,
	props,
}: {
	people: Props["roster"];
	props: Props;
}) => {
	const college = props.competition === "college";
	const cols: Col[] = [
		{ title: "Player" },
		{ title: "Pos" },
		numeric("Age"),
		...(!props.hideRatings ? [numeric("Ovr"), numeric("Pot")] : []),
		{ title: "Status" },
		numeric("GP"),
		numeric("MPG"),
		numeric("PPG"),
		numeric("RPG"),
		numeric("APG"),
	];
	const rows: DataTableRow[] = people.map((p) => {
		const stats = p.history
			.filter(
				(s) => s.season === props.season && s.competition === props.competition,
			)
			.at(-1);
		return {
			key: p.pid,
			data: [
				{
					value: <a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>,
					sortValue: p.name,
				},
				p.pos,
				p.age,
				...(!props.hideRatings ? [p.ovr, p.pot] : []),
				p.status === "draft"
					? "NBA draft prospect"
					: p.drafted
						? "Drafted"
						: p.assigned
							? "NBA assignment"
							: college
								? `${p.remaining} eligible seasons${p.redshirt ? ", redshirt" : ""}`
								: "G League",
				stats?.gp ?? 0,
				...(["min", "pts", "reb", "ast"] as const).map((key) =>
					stats?.gp ? fixed(stats[key] / stats.gp) : "—",
				),
			],
		};
	});
	return (
		<DataTable
			name={`Connected Roster ${props.section}`}
			cols={cols}
			rows={rows}
			defaultSort={[0, "asc"]}
			defaultStickyCols={1}
			pagination
		/>
	);
};

const BoxScore = ({
	game,
	props,
}: {
	game: NonNullable<Props["boxScore"]>;
	props: Props;
}) => {
	const teams =
		game.competition === "college" ? props.schools : props.affiliates;
	const name = (id: number) =>
		teams.find((t) => t.id === id)?.name ?? "Unknown team";
	return (
		<>
			<h2 className="h4">
				{name(game.home)} {game.pts?.[0] ?? "—"}–{game.pts?.[1] ?? "—"}{" "}
				{name(game.away)}
			</h2>
			<p className="text-body-secondary">
				Day {game.day} · {game.stage}{" "}
				{game.overtimes
					? `· ${game.overtimes} overtime period${game.overtimes === 1 ? "" : "s"}`
					: ""}
			</p>
			{game.box?.map((box, side) => (
				<div className="table-responsive mb-4" key={side}>
					<table className="table table-striped table-sm">
						<caption className="caption-top fw-bold">
							{name(side === 0 ? game.home : game.away)}
						</caption>
						<thead>
							<tr>
								<th>Player</th>
								<th>MIN</th>
								<th>PTS</th>
								<th>REB</th>
								<th>AST</th>
								<th>FG</th>
								<th>3PT</th>
								<th>FT</th>
								<th>TO</th>
								<th>PF</th>
							</tr>
						</thead>
						<tbody>
							{box.map((p) => (
								<tr key={p.pid}>
									<td>
										<a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>
									</td>
									<td>{p.min.toFixed(1)}</td>
									<td>{p.pts}</td>
									<td>{p.reb}</td>
									<td>{p.ast}</td>
									<td>
										{p.fg}/{p.fga}
									</td>
									<td>
										{p.tp}/{p.tpa}
									</td>
									<td>
										{p.ft}/{p.fta}
									</td>
									<td>{p.tov}</td>
									<td>{p.pf}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			))}
		</>
	);
};

const BasketballWorld = (props: Props) => {
	useTitleBar({ title: "College & G League" });
	const college = props.section === "college";
	const teams = college ? props.schools : props.affiliates;
	const selected =
		props.selectedTeam !== undefined
			? teams.find((t) => t.id === props.selectedTeam)
			: undefined;
	const tabs = [
		["college", "College standings"],
		["g_league", "G League standings"],
		["playoffs", "Playoffs"],
		["draft", "NBA draft pipeline"],
		["history", "History & rules"],
	];
	const name = (id: number) =>
		teams.find((t) => t.id === id)?.name ?? "Unknown team";
	return (
		<div style={{ maxWidth: 1280 }}>
			<p>
				College programs and G League clubs are managed automatically. Follow
				their standings, prospects, and playoffs while you manage your NBA team.
			</p>
			{!props.enabled ? (
				<p>
					Enable <strong>Connected Basketball</strong> under{" "}
					<a href={helpers.leagueUrl(["mods"])}>League → Mods</a>. The connected
					world will be created automatically.
				</p>
			) : !props.initialized ? (
				<p role="status">
					The connected world starts automatically when you begin the NBA
					regular season. Use Play → Until regular season to get started.
				</p>
			) : (
				<>
					<div className="border-top border-bottom py-2 mb-3 d-flex flex-wrap justify-content-between gap-2">
						<strong>
							{props.season} season · Day {props.day} ·{" "}
							{props.stage === "regular"
								? "Regular season"
								: props.stage === "postseason"
									? "Postseason"
									: "Offseason"}
						</strong>
						<span className="text-body-secondary">
							Advances with the NBA Play menu
						</span>
					</div>
					<nav className="nav nav-tabs mb-4" aria-label="Connected basketball">
						{tabs.map(([section, title]) => (
							<a
								key={section}
								href={url(section!)}
								className={`nav-link${props.section === section ? " active" : ""}`}
								aria-current={props.section === section ? "page" : undefined}
							>
								{title}
							</a>
						))}
					</nav>
					{props.section === "playoffs" ? (
						<WorldPlayoffs {...props} />
					) : props.section === "college" || props.section === "g_league" ? (
						selected ? (
							<>
								<a href={url(props.section)} className="d-inline-block mb-3">
									Back to {college ? "college" : "G League"} standings
								</a>
								<h2 className="h4">{selected.name}</h2>
								<p className="text-body-secondary">
									{selected.conference} · {selected.won}–{selected.lost} overall
									{college ? ` · Coach ${selected.coach}` : ""}
								</p>
								<PlayerTable props={props} people={props.roster} />
								<h3 className="h5 mt-4">Recent results</h3>
								{props.latest.length === 0 ? (
									<p>
										No games played yet. Results appear as the NBA calendar
										advances.
									</p>
								) : (
									<div className="table-responsive">
										<table className="table table-striped">
											<thead>
												<tr>
													<th>Day</th>
													<th>Home</th>
													<th>Score</th>
													<th>Away</th>
													<th>Competition</th>
												</tr>
											</thead>
											<tbody>
												{props.latest.map((game) => (
													<tr key={game.id}>
														<td>{game.day}</td>
														<td>{name(game.home)}</td>
														<td>
															<a href={url("game", game.id)}>
																{game.pts![0]}–{game.pts![1]}
															</a>
														</td>
														<td>{name(game.away)}</td>
														<td>{game.stage}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</>
						) : (
							<WorldStandings key={props.section} props={props} />
						)
					) : props.section === "draft" ? (
						<>
							<h2 className="h4">College-to-NBA draft pipeline</h2>
							<p>
								College programs handle recruiting, transfers, and eligibility.
								After their postseason, eligible prospects enter the{" "}
								<a href={helpers.leagueUrl(["draft"])}>normal NBA draft</a> with
								the same player identity and college history.
							</p>
							{props.prospects.length ? (
								<PlayerTable props={props} people={props.prospects} />
							) : (
								<p className="text-body-secondary">
									This season’s declarations are not complete yet. Continue the
									NBA season to see the draft class.
								</p>
							)}
						</>
					) : props.section === "game" ? (
						props.boxScore ? (
							<>
								<a
									href={url(
										props.boxScore.stage === "regular"
											? props.boxScore.competition === "college"
												? "college"
												: "g_league"
											: "playoffs",
									)}
									className="d-inline-block mb-3"
								>
									Back to{" "}
									{props.boxScore.stage === "regular"
										? "standings"
										: "playoffs"}
								</a>
								<BoxScore game={props.boxScore} props={props} />
							</>
						) : (
							<p>That game could not be found.</p>
						)
					) : (
						<>
							<h2 className="h4">Season history</h2>
							{props.archives.length ? (
								<div className="table-responsive">
									<table className="table table-striped">
										<thead>
											<tr>
												<th>Season</th>
												<th>College champion</th>
												<th>NIT champion</th>
												<th>G League champion</th>
												<th>NBA draft alumni</th>
											</tr>
										</thead>
										<tbody>
											{props.archives.map((row) => (
												<tr key={row.season}>
													<td>{row.season}</td>
													<td>{row.collegeChampion}</td>
													<td>{row.nitChampion}</td>
													<td>{row.gLeagueChampion}</td>
													<td>{row.draftPids.length}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p>The first season is still in progress.</p>
							)}
							<h2 className="h4 mt-4">How the connected world works</h2>
							<p>
								Rules profile: {props.rules}. All secondary clubs operate
								automatically: recruiting, transfers, roster decisions, and
								development. Their games advance alongside NBA days, and the
								college postseason finishes before the NBA draft. G League staff
								assign young NBA reserves and recall them when the parent team
								needs them or the G League season ends.
							</p>
							<p>
								College games use two halves and a five-foul limit. G League
								games use four quarters, six fouls, and single-free-throw
								scoring. Program strength, schedules, budgets, and postseason
								selection are simulation models. Individual eligibility waivers,
								two-way contracts, exact recruiting calendars, and every NCAA
								bracketing restriction are not modeled.
							</p>
						</>
					)}
					<details className="mt-4 border-top pt-3">
						<summary>World news</summary>
						<ul className="mt-2">
							{props.news.slice(0, 12).map((text, i) => (
								<li key={i}>{text}</li>
							))}
						</ul>
					</details>
				</>
			)}
		</div>
	);
};
export default BasketballWorld;
