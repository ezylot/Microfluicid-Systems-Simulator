import {ReturnDTO} from "../dtos/ReturnDTO";
import {SimulatedFluid} from "./SimulatedFluid";
import {ChannelLine} from "../fabricElements/ChannelLine";
import {Canvas} from "fabric/fabric-impl";
import {dropletInjections} from "../dropletInjections";
import {DropletInjection} from "./DropletInjection";
import {droplets} from "../droplets";
import {Droplet} from "./Droplet";

import "bootstrap-slider"

export class Simulator {
    private states: ReturnDTO[];
    private $footer: JQuery;
    private $progressBar: JQuery;
    private _currentState: number;
    private playerInterval: number;
    private readonly canvas: Canvas;

    private readonly fluidsToSimulate: Map<string, SimulatedFluid> = new Map<string, SimulatedFluid>();

    private readonly playCallback: () => void;
    private readonly pauseCallback: () => void;
    private readonly finishedPlayingCallback: () => void;

    public constructor(states: ReturnDTO[], $footer:  JQuery, canvas: Canvas, options: {playCallback?: () => void; pauseCallback?: () => void; finishedPlayingCallback?: () => void}) {
        this.states = states;
        this.$footer = $footer;
        this.canvas = canvas;

        this.fluidsToSimulate.clear();

        if(options){
            this.playCallback = options.playCallback || null;
            this.pauseCallback = options.pauseCallback || null;
            this.finishedPlayingCallback = options.finishedPlayingCallback || null;
        }

        this.$footer.find('.progressbar-max').text(states.length);
        this.$progressBar = $footer.find("#progressbar");
        this.$progressBar
            .attr('data-slider-value', 0)
            .attr('data-slider-max', this.states.length -  1);

        this.$progressBar.slider('destroy')
            .slider()
            .on('slide', (slideEvt: SliderEvent): void => {
                this.goTo(slideEvt.value as number);
            });
    }

    public get currentState(): number {
        return this._currentState;
    }

    public play(): void {
        if(!this.isPaused()) {
            clearInterval(this.playerInterval);
            this.playerInterval = null;
        }

        this.playerInterval = setInterval((): void => {
            this.redrawFunction();
            this.goTo(this._currentState + 1);

            if (this._currentState >= this.states.length) {
                this.pause();
                this.finishedPlayingCallback();
            }
        }, 20);
        this.playCallback();
    }

    public pause(): void {
        clearInterval(this.playerInterval);
        this.playerInterval = null;
        this.pauseCallback();
    }

    public isPaused(): boolean {
        return !this.playerInterval;
    }

    public goTo(position: number): void {
        this.$footer.find('.progressbar-current').text(position);
        this.$progressBar.attr('data-slider-value', position);
        this.$progressBar.slider('setValue', position);
        this._currentState = position;

        if(this.isPaused()) {
            this.redrawFunction();
        }
    }

    public destroy(): void {
        if(!this.isPaused()) {
            this.pause();
        }

        this.fluidsToSimulate.forEach((simulatedFluid): void => {
            simulatedFluid.remove(this.canvas);
        });

        this._currentState = 0;
        this.$footer.find('.progressbar-current').text(0);
        this.$footer.find('.progressbar-max').text(0);
        this.$progressBar
            .attr('data-slider-value', 0)
            .attr('data-slider-max', this.states.length -  1);
    }

    private redrawFunction(): void {
        let unusedNames: string[] = Array.from(this.fluidsToSimulate.keys());

        this.states[this._currentState].dropletStates.forEach((value): void => {
            let dropletInjection = dropletInjections.find((injection: DropletInjection): boolean => {
                return injection.injectionPumpName == value.dropletInjectionTime.pumpName && injection.injectionTime == value.dropletInjectionTime.timePoint * 1000;
            });

            let dropletToInject = droplets.find((droplet: Droplet): boolean => {
                return droplet.id === dropletInjection.dropletId
            });

            let dropletName = value.name;
            unusedNames.splice(unusedNames.findIndex((name: string): boolean => name === dropletName), 1);
            if (!this.fluidsToSimulate.get(dropletName)) {
                this.fluidsToSimulate.set(dropletName, new SimulatedFluid(
                    null,
                    0,
                    true,
                    null,
                    0,
                    true,
                    dropletToInject.color
                ));
            }

            if (value.dropletPositions.length === 1) {
                let dropletPosition = value.dropletPositions[0];
                let channel = this.getLineFromCoords(dropletPosition.edge);

                this.fluidsToSimulate.get(dropletName).changePosition(
                    channel,
                    dropletPosition.headPosition,
                    value.dropletPositions[0].defaultFlowDirection,
                    channel,
                    dropletPosition.tailPosition,
                    value.dropletPositions[0].defaultFlowDirection,
                );
            } else if (value.dropletPositions.length === 2) {
                let channel1 = this.getLineFromCoords(value.dropletPositions[0].edge);
                let channel2 = this.getLineFromCoords(value.dropletPositions[1].edge);

                this.fluidsToSimulate.get(dropletName).changePosition(
                    channel1,
                    value.dropletPositions[0].tailPosition,
                    value.dropletPositions[0].defaultFlowDirection,
                    channel2,
                    value.dropletPositions[1].headPosition,
                    value.dropletPositions[1].defaultFlowDirection,
                );
            } else if (value.dropletPositions.length === 0) {
                this.fluidsToSimulate.get(dropletName).remove(this.canvas);
                this.fluidsToSimulate.delete(dropletName);
            } else {
                // TODO: implement multi channel spanning droplets
                debugger;
                this.fluidsToSimulate.get(dropletName).remove(this.canvas);
                this.fluidsToSimulate.delete(dropletName);
            }
        });

        this.fluidsToSimulate.forEach((value: SimulatedFluid): void => {
            value.draw(this.canvas);
        });

        unusedNames.forEach((value: string): void => {
            this.fluidsToSimulate.get(value).remove(this.canvas);
        });

        this.canvas.renderAll();
    }

    private getLineFromCoords(coords: { x1: number; x2: number; y1: number; y2: number }): ChannelLine {
        return this.canvas.getObjects('line')
            .filter((value: ChannelLine): boolean => value.represents === 'line')
            .filter((value: ChannelLine): boolean => value.x1 === coords.x1)
            .filter((value: ChannelLine): boolean => value.x2 === coords.x2)
            .filter((value: ChannelLine): boolean => value.y1 === coords.y1)
            .filter((value: ChannelLine): boolean => value.y2 === coords.y2)[0] as ChannelLine;
    }
}


