import type { View } from "../../common/types.ts";
import useTitleBar from "../hooks/useTitleBar.tsx";
import { NbaCup as CupStandings } from "../components/NbaCup.tsx";
import { PlayoffMatchup } from "../components/PlayoffMatchup.tsx";
import { ResponsiveTableWrapper } from "../components/ResponsiveTableWrapper.tsx";
import { ChampionshipBanner } from "../components/ChampionshipBanner.tsx";
import { useLocal } from "../util/local.ts";

const NbaCup = ({ cup, season, series, confNames }: View<"nbaCup">) => {
	useTitleBar({
		title: "NBA Cup",
		dropdown: {
			fields: [{ key: "season", options: { type: "seasons" }, value: season }],
			view: "nbaCup",
		},
	});
	const { userTid } = useLocal(["userTid"]);
	if (!cup) {
		return (
			<p>
				No NBA Cup was scheduled for this season. The cup starts when a 30-team
				basketball league with two 15-team conferences begins an 82-game regular
				season.
			</p>
		);
	}
	const matchup = (round: number, index: number) =>
		series[round]?.[index] ? (
			<PlayoffMatchup
				numGamesToWinSeries={1}
				season={season}
				series={series[round]![index]}
				userTid={userTid}
			/>
		) : (
			<p className="text-body-secondary text-center small">
				Awaiting {round === 1 ? "quarterfinal" : "semifinal"} winners
			</p>
		);
	const final = series[2]?.[0];
	const champion =
		final?.home.won === 1
			? final.home
			: final?.away?.won === 1
				? final.away
				: undefined;
	return (
		<>
			{cup.seeds ? (
				<section
					className="mb-4"
					aria-label="NBA Cup knockout bracket"
					style={{ maxWidth: 1050 }}
				>
					<h2 className="h4">Knockout bracket</h2>
					<div className="d-flex justify-content-between mb-2">
						<strong>{confNames[0]}</strong>
						<strong>{confNames[1]}</strong>
					</div>
					<ResponsiveTableWrapper>
						<table
							className="table-sm w-100"
							style={{ minWidth: 850 }}
							aria-label="NBA Cup bracket"
						>
							<thead>
								<tr className="text-center text-body-secondary">
									{[
										"Quarterfinals",
										"Semifinals",
										"Championship",
										"Semifinals",
										"Quarterfinals",
									].map((name, i) => (
										<th key={i} scope="col" style={{ width: "20%" }}>
											{name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{matchup(0, 0)}</td>
									<td rowSpan={2}>{matchup(1, 0)}</td>
									<td rowSpan={2}>{matchup(2, 0)}</td>
									<td rowSpan={2}>{matchup(1, 1)}</td>
									<td>{matchup(0, 2)}</td>
								</tr>
								<tr>
									<td>{matchup(0, 1)}</td>
									<td>{matchup(0, 3)}</td>
								</tr>
							</tbody>
						</table>
					</ResponsiveTableWrapper>
					{champion ? (
						<div className="d-flex justify-content-center mt-3">
							<ChampionshipBanner
								championshipName="NBA Cup Champions"
								className="w-100"
								season={season}
								t={champion}
								hideRope
							/>
						</div>
					) : null}
				</section>
			) : null}
			<CupStandings cup={cup} />
		</>
	);
};

export default NbaCup;
