import {fluids} from "./fluids";
import {droplets} from "./droplets";
import {dropletInjections} from "./dropletInjections";
import {defaultDefaultValues, setDefaultValues} from "./defaultvalue";
import {pumps} from "./workspace";

export function resetValues(): void {
    fluids.length = 0;
    droplets.length = 0;
    dropletInjections.length = 0;
    pumps.length = 0;

    // TODO: reset all the other values

    setDefaultValues(defaultDefaultValues);
}
