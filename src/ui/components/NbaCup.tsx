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
