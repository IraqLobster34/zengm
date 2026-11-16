import type { BasketballPathway as Pathway } from "../../common/basketballWorld.ts";
import { helpers } from "../util/helpers.ts";

export const BasketballPathway = ({ pathway }: { pathway?: Pathway }) =>
	pathway ? (
		<section className="mb-4" aria-label="College and G League career">
			<h2 className="h4">College & G League career</h2>
			<p>
				Current pathway:{" "}
				{pathway.assigned
					? "NBA player on G League assignment"
					: pathway.status === "gLeague"
						? "G League"
						: pathway.status}
				.{" "}
				<a href={helpers.leagueUrl(["basketball_world"])}>
					Open connected basketball
				</a>
			</p>
			{pathway.history.length > 0 ? (
				<div className="table-responsive">
					<table className="table table-striped table-sm">
						<thead>
							<tr>
								<th>Season</th>
								<th>Competition</th>
								<th>Team</th>
								<th>GP</th>
								<th>MPG</th>
								<th>PPG</th>
								<th>RPG</th>
								<th>APG</th>
							</tr>
						</thead>
						<tbody>
							{pathway.history.map((row, i) => (
								<tr key={i}>
									<td>{row.season}</td>
									<td>
										{row.competition === "college" ? "College" : "G League"}
									</td>
									<td>{row.team}</td>
									<td>{row.gp}</td>
									{["min", "pts", "reb", "ast"].map((stat) => (
										<td key={stat}>
											{(
												row[stat as "min" | "pts" | "reb" | "ast"] /
												Math.max(1, row.gp)
											).toFixed(1)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-body-secondary">
					No college or G League games recorded yet.
				</p>
			)}
		</section>
	) : null;
