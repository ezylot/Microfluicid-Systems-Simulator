import {PhysicalDropletStateDTO} from "./PhysicalDropletStateDTO";

export interface ReturnDTO {
    time: number;
    dropletStates: PhysicalDropletStateDTO[];
}
