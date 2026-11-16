import { useState } from "react";
import type { View } from "../../common/types.ts";
import { ModSelection } from "../components/ModSelection.tsx";
import { useBlocker } from "../hooks/useBlocker.ts";
import useTitleBar from "../hooks/useTitleBar.tsx";
import { toWorker } from "../util/toWorker.ts";
import { helpers } from "../util/helpers.ts";

const ModsForm = ({
	configuration,
	inLeague,
	cupLocked,
	worldLocked,
	hasCupHistory,
}: View<"mods">) => {
	useTitleBar({ title: inLeague ? "League Mods" : "Mods" });
	const [selection, setSelection] = useState(configuration);
	const { setDirty } = useBlocker();
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	return (
		<form
			style={{ maxWidth: 760 }}
			onSubmit={async (event) => {
				event.preventDefault();
				setSaving(true);
				setError("");
				setMessage("");
				try {
					await toWorker("main", "saveModSelection", {
						configuration: selection,
						inLeague,
					});
					setDirty(false);
					setMessage(
						inLeague
							? "League mods saved. Scheduling changes apply when the next season's schedule is created."
							: "Default mods saved. Your next new league will use this selection.",
					);
				} catch (error) {
					setError(error instanceof Error ? error.message : String(error));
				} finally {
					setSaving(false);
				}
			}}
		>
			<p>
				{inLeague
					? "Choose the mods used by this league. Scheduling changes apply to the next season's schedule. Completed results and honors stay in your league history."
					: "Choose default mods for new leagues. Each league keeps its own selection, which you can change under League → Mods."}
			</p>
			<p className="text-body-secondary">
				Bundled mods are included with this copy of the game.
			</p>
			<ModSelection
				configuration={selection}
				onChange={(value) => {
					setSelection(value);
					setDirty(true);
					setMessage("");
					setError("");
				}}
				disabled={saving}
				cupLocked={cupLocked}
				worldLocked={worldLocked}
			/>
			{error ? (
				<div className="alert alert-danger" role="alert">
					{error}
				</div>
			) : null}
			{message ? (
				<div className="alert alert-success" role="status">
					{message}
				</div>
			) : null}
			<div className="d-flex flex-wrap align-items-center gap-3">
				<button className="btn btn-primary" disabled={saving}>
					{saving ? "Saving…" : inLeague ? "Save league mods" : "Save defaults"}
				</button>
				{inLeague ? (
					<a href="/mods">Defaults for new leagues</a>
				) : (
					<a href="/new_league">New league</a>
				)}
				{hasCupHistory ? (
					<a href={helpers.leagueUrl(["nba_cup"])}>
						NBA Cup results and history
					</a>
				) : null}
			</div>
		</form>
	);
};

const Mods = (props: View<"mods">) => (
	<ModsForm key={props.inLeague ? props.lid : "defaults"} {...props} />
);

export default Mods;
