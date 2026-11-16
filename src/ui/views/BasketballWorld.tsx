import { useState } from "react";
import type { View } from "../../common/types.ts";
import type { WorldAction } from "../../worker/core/basketballWorld/index.ts";
import useTitleBar from "../hooks/useTitleBar.tsx";
import { helpers } from "../util/helpers.ts";
import { toWorker } from "../util/toWorker.ts";
import { realtimeUpdate } from "../util/realtimeUpdate.ts";

type Person = View<"basketballWorld">["roster"][number];
const money = (amount: number) => `$${Math.round(amount).toLocaleString()}`;
const nameLink = (p: Person) => (
	<a href={helpers.leagueUrl(["player", p.pid])}>{p.name}</a>
);

const BasketballWorld = (props: View<"basketballWorld">) => {
	useTitleBar({ title: "College & G League" });
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [conference, setConference] = useState("");
	const [offer, setOffer] = useState("50000");
	const action = async (request: WorldAction) => {
		setBusy(true);
		setError("");
		setMessage("");
		try {
			await toWorker("main", "basketballWorldAction", request);
			await realtimeUpdate(["playerMovement"]);
			setMessage("World updated.");
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
		}
	};
	const school = props.schools.find((t) => t.id === props.schoolId);
	const managed = props.schools.find((t) => t.id === props.userSchoolId);
	const teams = props.section === "g_league" ? props.affiliates : props.schools;
	const teamName = (id: number, competition: string) =>
		(competition === "college" ? props.schools : props.affiliates).find(
			(t) => t.id === id,
		)?.name ?? "Unknown team";
	const playerTable = (
		people: Person[],
		mode: "roster" | "recruit" | "nba" | "callUp" | "draft",
	) => (
		<div className="table-responsive">
			<table className="table table-striped table-sm">
				<thead>
					<tr>
						<th>Player</th>
						<th>Pos</th>
						<th>Age</th>
						{!props.hideRatings ? (
							<>
								<th>Ovr</th>
								<th>Pot</th>
							</>
						) : null}
						<th>{mode === "recruit" ? "Interest" : "Team / pathway"}</th>
						<th>GP</th>
						<th>PPG</th>
						<th>RPG</th>
						<th>APG</th>
						<th>Action / status</th>
					</tr>
				</thead>
				<tbody>
					{people.map((p) => {
						const stats = p.history
							.filter((row) => row.season === props.season)
							.at(-1);
						return (
							<tr key={p.pid}>
								<td>{nameLink(p)}</td>
								<td>{p.pos}</td>
								<td>{p.age}</td>
								{!props.hideRatings ? (
									<>
										<td>{p.ovr}</td>
										<td>{p.pot}</td>
									</>
								) : null}
								<td>
									{mode === "recruit"
										? `${Math.round(p.interest)} / 100`
										: p.status === "college"
											? `${p.remaining} eligible season${p.remaining === 1 ? "" : "s"}${p.redshirt ? ", redshirt" : ""}`
											: p.assigned
												? "NBA assignment"
												: p.status === "nba"
													? "NBA"
													: p.status === "draft"
														? p.college
														: "G League"}
								</td>
								<td>{stats?.gp ?? 0}</td>
								{["pts", "reb", "ast"].map((key) => (
									<td key={key}>
										{stats && stats.gp > 0
											? (
													stats[key as "pts" | "reb" | "ast"] / stats.gp
												).toFixed(1)
											: "—"}
									</td>
								))}
								<td>
									{mode === "recruit" ? (
										<button
											className="btn btn-sm btn-outline-primary"
											disabled={busy || !props.recruitingOpen}
											onClick={() =>
												void action({
													type: "recruit",
													pid: p.pid,
													nil: Number(offer),
												})
											}
										>
											Offer / recruit
										</button>
									) : mode === "nba" ? (
										<button
											className="btn btn-sm btn-outline-primary"
											disabled={busy}
											onClick={() =>
												void action({
													type: p.assigned ? "recall" : "assign",
													pid: p.pid,
												})
											}
										>
											{p.assigned ? "Recall to NBA" : "Assign to affiliate"}
										</button>
									) : mode === "callUp" ? (
										<button
											className="btn btn-sm btn-outline-primary"
											disabled={busy}
											onClick={() =>
												void action({ type: "callUp", pid: p.pid })
											}
										>
											Sign NBA minimum
										</button>
									) : mode === "roster" &&
									  props.section === "college" &&
									  props.schoolId === props.userSchoolId ? (
										<button
											className="btn btn-sm btn-outline-secondary"
											disabled={busy || props.day > 0}
											onClick={() =>
												void action({ type: "redshirt", pid: p.pid })
											}
										>
											{p.redshirt ? "Activate" : "Redshirt"}
										</button>
									) : p.drafted ? (
										"Drafted"
									) : p.status === "draft" ? (
										"Available in NBA draft"
									) : (
										""
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{people.length === 0 ? (
				<p className="text-body-secondary">No players here yet.</p>
			) : null}
		</div>
	);

	return (
		<div style={{ maxWidth: 1200 }}>
			<p>
				Follow a player from college basketball through the NBA draft and G
				League development. All three competitions share this league save.
			</p>
			{error ? (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			) : null}
			{message ? (
				<div className="visually-hidden" role="status">
					{message}
				</div>
			) : null}
			{!props.enabled ? (
				<p>
					Enable <strong>Connected Basketball</strong> under{" "}
					<a href={helpers.leagueUrl(["mods"])}>League → Mods</a> to create a
					connected world.
				</p>
			) : !props.initialized ? (
				<>
					<p>
						Create the world with 365 colleges, conference tournaments, a
						national championship, and 31 G League clubs. Players and coaches
						are generated.
					</p>
					<button
						className="btn btn-primary"
						disabled={busy}
						onClick={() => void action({ type: "initialize" })}
					>
						{busy ? "Building world…" : "Create connected world"}
					</button>
				</>
			) : (
				<>
					<div className="d-flex flex-wrap align-items-center gap-2 mb-3">
						<strong>
							{props.season} season · Day {props.day} ·{" "}
							{props.stage === "regular"
								? "Regular season"
								: props.stage === "postseason"
									? "Postseason"
									: "Offseason"}
						</strong>
						<span className="ms-sm-auto" />
						<button
							className="btn btn-sm btn-outline-primary"
							disabled={busy || props.stage === "offseason"}
							onClick={() => void action({ type: "advance", days: 1 })}
						>
							Play day
						</button>
						<button
							className="btn btn-sm btn-outline-primary"
							disabled={busy || props.stage === "offseason"}
							onClick={() => void action({ type: "advance", days: 7 })}
						>
							Play week
						</button>
						<button
							className="btn btn-sm btn-outline-primary"
							disabled={busy || props.stage === "offseason"}
							onClick={() => void action({ type: "advance", days: 164 })}
						>
							{busy ? "Simulating…" : "Finish world season"}
						</button>
					</div>
					<p className="small text-body-secondary">
						College and G League games also advance as you play NBA days. The
						NBA draft waits for the college postseason to finish.
					</p>
					<nav
						aria-label="Basketball competitions"
						className="nav nav-tabs mb-3"
					>
						{[
							["college", "College"],
							["recruiting", "Recruiting & transfers"],
							["g_league", "G League"],
							["draft", "NBA draft pipeline"],
							["history", "History & rules"],
						].map(([section, title]) => (
							<a
								key={section}
								className={`nav-link${props.section === section ? " active" : ""}`}
								aria-current={props.section === section ? "page" : undefined}
								href={helpers.leagueUrl(["basketball_world", section!])}
							>
								{title}
							</a>
						))}
					</nav>
					{props.section === "college" || props.section === "g_league" ? (
						<>
							<div className="row g-3 mb-3">
								<div className="col-md-6">
									<label htmlFor="world-team" className="form-label">
										{props.section === "college" ? "College" : "G League club"}
									</label>
									<select
										id="world-team"
										className="form-select"
										value={
											props.section === "college"
												? props.schoolId
												: (props.roster[0]?.affiliateId ??
													props.affiliates[0]?.id)
										}
										onChange={(event) =>
											void realtimeUpdate(
												[],
												helpers.leagueUrl([
													"basketball_world",
													props.section,
													event.target.value,
												]),
											)
										}
									>
										{teams.map((t) => (
											<option key={t.id} value={t.id}>
												{t.name}
											</option>
										))}
									</select>
								</div>
								{school && props.section === "college" ? (
									<div className="col-md-6 align-self-end">
										<p className="mb-1">
											{school.conference} · {school.won}–{school.lost} (
											{school.confWon}–{school.confLost} conference)
										</p>
										<p className="small mb-1">
											Coach: {school.coach} · Program prestige:{" "}
											{school.prestige} · NIL budget:{" "}
											{money(school.budget - school.spent)} remaining
										</p>
										{props.schoolId !== props.userSchoolId ? (
											<button
												className="btn btn-sm btn-outline-primary"
												disabled={busy}
												onClick={() =>
													void action({
														type: "manageCollege",
														teamId: props.schoolId,
													})
												}
											>
												Manage this college
											</button>
										) : (
											<span className="small text-success">
												Your college program
											</span>
										)}
									</div>
								) : null}
							</div>
							{playerTable(props.roster, "roster")}
							<h2 className="h4">Standings</h2>
							<label htmlFor="world-conference" className="form-label">
								Conference
							</label>
							<select
								id="world-conference"
								className="form-select mb-2"
								style={{ maxWidth: 420 }}
								value={conference}
								onChange={(event) => setConference(event.target.value)}
							>
								<option value="">All conferences</option>
								{[...new Set(teams.map((t) => t.conference))]
									.sort()
									.map((name) => (
										<option key={name}>{name}</option>
									))}
							</select>
							<div className="table-responsive">
								<table className="table table-striped table-sm">
									<thead>
										<tr>
											<th>Team</th>
											<th>Conference</th>
											<th>W</th>
											<th>L</th>
											<th>Conf W</th>
											<th>Conf L</th>
											<th>Point differential</th>
										</tr>
									</thead>
									<tbody>
										{teams
											.filter((t) => !conference || t.conference === conference)
											.sort((a, b) => b.won - a.won || a.lost - b.lost)
											.map((t) => (
												<tr key={t.id}>
													<td>
														<a
															href={helpers.leagueUrl([
																"basketball_world",
																props.section,
																t.id,
															])}
														>
															{t.name}
														</a>
													</td>
													<td>{t.conference}</td>
													<td>{t.won}</td>
													<td>{t.lost}</td>
													<td>{t.confWon}</td>
													<td>{t.confLost}</td>
													<td>{t.pf - t.pa}</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
							{props.section === "g_league" ? (
								<>
									<h2 className="h4">Your NBA roster</h2>
									<p>
										Assignments keep the NBA contract and roster spot. Recall a
										player to make him available for NBA games.
									</p>
									{playerTable(props.nbaRoster, "nba")}
									<h2 className="h4">Available for NBA call-up</h2>
									<p>
										Signing uses an NBA roster spot and a minimum contract. G
										League affiliation alone does not give the parent NBA team
										exclusive signing rights.
									</p>
									{playerTable(props.callUps, "callUp")}
								</>
							) : null}
							<h2 className="h4">Recent games</h2>
							{props.latest.length === 0 ? (
								<p>No games played yet.</p>
							) : (
								props.latest.map((game) => (
									<details className="border-top py-2" key={game.id}>
										<summary>
											{teamName(game.home, game.competition)} {game.pts![0]}–
											{game.pts![1]} {teamName(game.away, game.competition)} ·
											Day {game.day} · {game.stage}
										</summary>
										{game.box?.map((box, i) => (
											<div className="table-responsive" key={i}>
												<table className="table table-sm">
													<caption className="caption-top">
														{teamName(
															i === 0 ? game.home : game.away,
															game.competition,
														)}
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
																	<a
																		href={helpers.leagueUrl(["player", p.pid])}
																	>
																		{p.name}
																	</a>
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
									</details>
								))
							)}
						</>
					) : props.section === "recruiting" ? (
						<>
							<h2 className="h4">Recruit for {managed?.name}</h2>
							<p>
								{props.recruitingOpen
									? `Signing period open. ${props.recruitingPoints} recruiting points remain; each contact costs 10.`
									: "The transfer portal and incoming recruiting class open after the NBA draft. Returning players and recruits are allocated before the next preseason."}
							</p>
							<label htmlFor="nil-offer" className="form-label">
								Annual NIL offer
							</label>
							<input
								id="nil-offer"
								type="number"
								min="0"
								step="10000"
								value={offer}
								onChange={(event) => setOffer(event.target.value)}
								className="form-control mb-3"
								style={{ maxWidth: 240 }}
							/>
							<p className="small text-body-secondary">
								Offers increase interest. A commitment uses one of 15 roster
								places and must fit the program budget. NIL values are
								simulated.
							</p>
							{playerTable(props.recruits, "recruit")}
						</>
					) : props.section === "draft" ? (
						<>
							<h2 className="h4">College prospects in the NBA draft</h2>
							<p>
								Prospects become available after the college postseason and the
								declaration process. Draft them from the game's{" "}
								<a href={helpers.leagueUrl(["draft"])}>NBA draft screen</a>.
								Their college careers remain on their player profiles.
							</p>
							{playerTable(props.prospects, "draft")}
						</>
					) : (
						<>
							<h2 className="h4">Season history</h2>
							{props.archives.length === 0 ? (
								<p>The first season is still in progress.</p>
							) : (
								<div className="table-responsive">
									<table className="table">
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
													<td>
														{row.draftPids.map((pid) => (
															<a
																key={pid}
																className="me-2"
																href={helpers.leagueUrl(["player", pid])}
															>
																#{pid}
															</a>
														))}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
							<h2 className="h4">Rules and simulation model</h2>
							<p>
								Rules profile: {props.rules}. College eligibility tracks
								enrollment, seasons played, academic standing, and redshirts.
								Later entrants use the five-year model. Individual waivers,
								recruiting calendars, two-way contracts, and the full NCAA
								compliance system are not modeled in this version.
							</p>
							<p>
								College games use two halves and a five-foul limit; G League
								games use four quarters, six fouls, and the single-free-throw
								scoring rule. Standings and box scores are separate from NBA
								statistics. Schedules, budgets, coaching strength, postseason
								selection, and program prestige are modeled rather than exact
								reproductions of real seasons.
							</p>
							<p>
								NBA affiliates are mapped to available teams in this league. NBA
								assignments retain the parent contract. G League free agents can
								sign with another NBA team after passing roster and budget
								checks.
							</p>
						</>
					)}
					{props.tournaments.length > 0 ? (
						<>
							<h2 className="h4 mt-4">Tournaments</h2>
							<div className="table-responsive">
								<table className="table table-sm">
									<thead>
										<tr>
											<th>Competition</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{props.tournaments.map((t) => (
											<tr key={t.name}>
												<td>{t.name}</td>
												<td>
													{t.champion !== undefined
														? `${teamName(t.champion, t.competition)} — champions`
														: `${t.teams.length} remaining · Round ${t.round}`}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					) : null}
					<h2 className="h4 mt-4">World news</h2>
					<ul>
						{props.news.slice(0, 12).map((text, i) => (
							<li key={i}>{text}</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
};

export default BasketballWorld;
