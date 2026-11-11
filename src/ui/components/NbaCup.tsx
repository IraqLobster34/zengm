import {
	cupStageName,
	cupStandings,
	type NbaCup as Cup,
} from "../../common/nbaCup.ts";
import { useLocal } from "../util/local.ts";
import { helpers } from "../util/helpers.ts";

export const NbaCup = ({ cup }: { cup: Cup }) => {
	const { teamInfoCache, userTid } = useLocal(["teamInfoCache", "userTid"]);
	const teamLink = (tid: number) => {
		const t = teamInfoCache[tid];
		return (
			<a
				href={helpers.leagueUrl(["roster", `${t?.abbrev}_${tid}`, cup.season])}
			>
				{t?.abbrev ?? tid}
			</a>
		);
	};
	return (
		<section className="mb-4" aria-labelledby="nba-cup-title">
			<h2 id="nba-cup-title">
				NBA Cup{" "}
				<small className="text-body-secondary">
					{cup.season} · {cupStageName(cup.stage)}
				</small>
			</h2>
			{cup.champion !== undefined ? (
				<p className="fs-5">
					<strong>{teamLink(cup.champion)} wins the NBA Cup!</strong>
				</p>
			) : null}
			{cup.mvp ? (
				<p>
					<strong>NBA Cup MVP:</strong>{" "}
					<a href={helpers.leagueUrl(["player", cup.mvp.pid])}>
						{cup.mvp.name}
					</a>
				</p>
			) : null}
			<p className="text-body-secondary">
				Six groups. Eight qualifiers. One cup. Group winners and one wild card
				per conference advance. All cup games count toward the regular season
				except the championship.
			</p>
			{cup.draw ? (
				<details className="mb-3">
					<summary>Group draw pots</summary>
					<p className="small text-body-secondary mt-2">
						Each conference is split into five pots using{" "}
						{cup.draw.previousSeason} regular-season standings: ranks 1–3, 4–6,
						7–9, 10–12, and 13–15. Each group draws one team from each pot.
					</p>
					{cup.draw.unseededTids.length > 0 ? (
						<p className="small text-body-secondary">
							{cup.draw.unseededTids.length === 30
								? "No prior-season records were available, so the first draw was randomized."
								: "Teams without prior-season results fill the remaining lowest-ranked slots in random order."}
						</p>
					) : null}
					{cup.draw.pots.map((conference, i) => (
						<div key={conference.cid} className="mb-2">
							<strong>
								Groups {String.fromCharCode(65 + i * 3)}–
								{String.fromCharCode(67 + i * 3)}
							</strong>
							<ol>
								{conference.tids.map((pot, index) => (
									<li key={index}>
										Pot {index + 1}:{" "}
										{pot.map((tid, j) => (
											<span key={tid}>
												{j > 0 ? ", " : ""}
												{teamLink(tid)}
											</span>
										))}
									</li>
								))}
							</ol>
						</div>
					))}
				</details>
			) : null}
			<details open={cup.stage === "group"}>
				<summary className="mb-2">Group standings</summary>
				<div className="row">
					{cup.groups.map((group, i) => (
						<div className="col-sm-6 col-xl-4" key={i}>
							<table className="table table-sm">
								<caption className="caption-top">
									Group {String.fromCharCode(65 + i)}
								</caption>
								<thead>
									<tr>
										<th scope="col">Team</th>
										<th scope="col">W</th>
										<th scope="col">L</th>
										<th scope="col">
											<abbr title="Point differential">Diff</abbr>
										</th>
										<th scope="col">Points</th>
									</tr>
								</thead>
								<tbody>
									{cupStandings(cup, group.tids).map((row) => (
										<tr
											key={row.tid}
											className={row.tid === userTid ? "table-info" : undefined}
										>
											<th scope="row">
												{teamLink(row.tid)}{" "}
												{cup.seeds?.flat().includes(row.tid) ? (
													<span title="Qualified for knockout rounds">✓</span>
												) : null}
											</th>
											<td>{row.won}</td>
											<td>{row.lost}</td>
											<td>
												{row.diff > 0 ? "+" : ""}
												{row.diff}
											</td>
											<td>{row.pts}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>
				<p className="small text-body-secondary">
					Ties: head-to-head for two teams in the same group, then point
					differential, points scored, and draw order. Wild cards use record,
					differential, and points.
				</p>
			</details>
		</section>
	);
};
