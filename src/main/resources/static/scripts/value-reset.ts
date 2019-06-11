import {fluids} from "./fluids";
import {droplets} from "./droplets";
import {dropletInjections} from "./dropletInjections";
import {defaultDefaultValues, setDefaultValues} from "./defaultvalue";

export function resetValues(): void {
    fluids.length = 0;
    droplets.length = 0;
    dropletInjections.length = 0;

    // TODO: reset all the rest

    // @ts-ignore
    pumps = [];

    setDefaultValues(defaultDefaultValues);
}
