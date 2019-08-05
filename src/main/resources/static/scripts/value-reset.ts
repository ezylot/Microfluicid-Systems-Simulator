import {deleteFluid, fluids} from "./fluids";
import {deleteDroplet, droplets} from "./droplets";
import {defaultDefaultValues, setDefaultValues} from "./defaultvalue";
import {canvasToSave, deletePumpObject, pumps} from "./workspace";
import {setPhaseProperties} from "./phases";
import {PhaseProperties} from "./classes/PhaseProperties";
import {Footer} from "./Footer";
import {resetDropletInjections} from "./dropletInjections";

export function resetValues(): void {
    canvasToSave.clear();
    Footer.getInstance().resetSimulator();

    resetDropletInjections();
    pumps.splice(0).forEach((value): void => deletePumpObject(value));
    fluids.splice(0).forEach((value): void => deleteFluid(value));
    setPhaseProperties(new PhaseProperties(null, null, null, null));
    droplets.splice(0).forEach((value): void => deleteDroplet(value));


    setDefaultValues(defaultDefaultValues);
}
