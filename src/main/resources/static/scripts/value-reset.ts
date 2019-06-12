import {deleteFluid, fluids} from "./fluids";
import {deleteDroplet, droplets} from "./droplets";
import {deleteDropletInjection, dropletInjections} from "./dropletInjections";
import {defaultDefaultValues, setDefaultValues} from "./defaultvalue";
import {canvasToSave, pumps} from "./workspace";
import {setPhaseProperties} from "./phases";
import {PhaseProperties} from "./classes/PhaseProperties";

export function resetValues(): void {
    canvasToSave.clear();
    pumps.length = 0;

    fluids.forEach((value): void => deleteFluid(value));
    setPhaseProperties(new PhaseProperties(null, null, null, null));
    droplets.forEach((value): void => deleteDroplet(value));
    dropletInjections.forEach((value): void => deleteDropletInjection(value));

    setDefaultValues(defaultDefaultValues);
}
