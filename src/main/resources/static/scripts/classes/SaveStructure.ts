import {DefaultValues} from "./DefaultValues";
import {Droplet} from "./Droplet";
import {DropletInjection} from "./DropletInjection";
import {PhaseProperties} from "./PhaseProperties";
import {Fluid} from "./Fluid";
import {Channel} from "./Channel";
import {Pump} from "./Pump";

export interface SaveStructure {
    fluids: Fluid[];
    pumps: Pump[];
    droplets: Droplet[];
    dropletInjections: DropletInjection[];
    phaseProperties: PhaseProperties;
    defaultValues: DefaultValues;
    canvas: {
        lines: Channel[];
    };
}
