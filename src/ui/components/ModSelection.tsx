import { modRegistry, type ModConfiguration } from "../../common/mods.ts";

export const ModSelection = ({
	configuration,
	onChange,
	disabled,
	imported,
	cupLocked,
	worldLocked,
}: {
	configuration: ModConfiguration;
	onChange: (configuration: ModConfiguration) => void;
	disabled?: boolean;
	imported?: boolean;
	cupLocked?: boolean;
	worldLocked?: boolean;
}) => (
	<fieldset className="mb-4" disabled={disabled || imported}>
		<legend className="h4">Mods</legend>
		{imported ? (
			<p className="text-body-secondary">
				Mod settings will come from the imported league. You can review them in
				League → Mods after importing.
			</p>
		) : null}
		{modRegistry.map((mod) => {
			const supported = mod.sports.includes(__SPORT);
			const enabled = configuration[mod.id]?.enabled === true;
			const locked =
				(mod.id === "nba-cup" && cupLocked) ||
				(mod.id === "basketball-world" && worldLocked);
			return (
				<div className="border-top py-3" key={mod.id}>
					<div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
						<div>
							<label className="fw-bold" htmlFor={`mod-${mod.id}`}>
								{mod.name}
							</label>{" "}
							<span className="text-body-secondary small">v{mod.version}</span>
						</div>
						<div className="form-check form-switch">
							<input
								id={`mod-${mod.id}`}
								className="form-check-input"
								type="checkbox"
								role="switch"
								checked={enabled}
								disabled={!supported || locked}
								aria-describedby={`mod-${mod.id}-details`}
								onChange={(event) =>
									onChange({
										...configuration,
										[mod.id]: {
											enabled: event.target.checked,
											version: mod.version,
										},
									})
								}
							/>
							<span className="small">
								{!supported
									? "Basketball only"
									: locked
										? mod.id === "basketball-world"
											? "Connected world"
											: "Active tournament"
										: enabled
											? "Enabled"
											: "Disabled"}
							</span>
						</div>
					</div>
					<div id={`mod-${mod.id}-details`}>
						<p className="mt-2 mb-1">{mod.description}</p>
						<p className="small text-body-secondary mb-0">
							Requires {mod.requirements}
						</p>
						{locked ? (
							<p className="small mt-2 mb-0">
								{mod.id === "basketball-world"
									? "This mod stays enabled to preserve the connected world in this save."
									: "Finish the active NBA Cup before changing this mod."}
							</p>
						) : null}
					</div>
				</div>
			);
		})}
	</fieldset>
);
