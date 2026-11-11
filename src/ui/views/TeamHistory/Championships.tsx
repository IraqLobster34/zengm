import type { View } from "../../../common/types.ts";
import { ChampionshipBanner } from "../../components/ChampionshipBanner.tsx";
import HideableSection from "../../components/HideableSection.tsx";
import { helpers } from "../../util/helpers.ts";

export const Championships = ({
	history,
	cup = false,
}: Pick<View<"teamHistory">, "history"> & { cup?: boolean }) => {
	const championshipRows = history.filter((row) =>
		cup ? row.nbaCupWinner : row.playoffRoundsWon === row.numPlayoffRounds,
	);

	const count = championshipRows.length;

	return (
		<HideableSection
			title={helpers.plural(
				`${count} ${cup ? "NBA Cup Win" : "Championship"}`,
				count,
			)}
			titleKeyOverride={cup ? "NBA Cup Wins" : "Championships"}
		>
			{count === 0 ? (
				<p>None</p>
			) : (
				<div className="d-flex gap-2 overflow-auto mb-3">
					{championshipRows.map((row) => {
						return (
							<a
								href={
									cup
										? helpers.leagueUrl(["nba_cup", row.season])
										: helpers.leagueUrl([
												"roster",
												`${row.abbrev}_${row.tid}`,
												row.season,
											])
								}
								key={row.season}
							>
								<ChampionshipBanner
									championshipName={cup ? "NBA Cup Champions" : undefined}
									className="flex-shrink-0"
									hideRope
									hideText={!cup}
									season={row.season}
									style={{ width: 90 }}
									t={{
										colors: row.colors,
										imgURLSmall: row.imgURLSmall,
									}}
								/>
							</a>
						);
					})}
				</div>
			)}
		</HideableSection>
	);
};
