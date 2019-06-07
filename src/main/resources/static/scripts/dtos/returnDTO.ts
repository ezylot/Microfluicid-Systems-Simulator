import {PhysicalDropletStateDTO} from "./physicalDropletStateDTO";

export interface ReturnDTO {
    time: number;
    dropletStates: PhysicalDropletStateDTO[];
}
