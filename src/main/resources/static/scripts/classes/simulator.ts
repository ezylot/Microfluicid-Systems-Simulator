import {ReturnDTO} from "../dtos/returnDTO";
import {fabric} from "fabric";

class Simulator {
    private states: ReturnDTO[];
    private $footer: JQuery;
    private $progressBar: JQuery;
    private currentState: number;
    private playerInterval: number;
    private canvas: fabric.Canvas;

    private fluidsToSimulate: Record<string, SimulatedFluid>;

    private playCallback: () => {};
    private pauseCallback: () => {};
    private finishedPlayingCallback: () => {};

    public constructor(states: ReturnDTO[], $footer:  JQuery, canvas: fabric.Canvas, options: {playCallback?: () => {}; pauseCallback?: () => {}; finishedPlayingCallback?: () => {}}) {
        this.states = states;
        this.$footer = $footer;
        this.canvas = canvas;

        this.fluidsToSimulate = {};

        if(options){
            this.playCallback = options.playCallback || null;
            this.pauseCallback = options.pauseCallback || null;
            this.finishedPlayingCallback = options.finishedPlayingCallback || null;
        }

        this.$footer.find('.progressbar-max').text(states.length);
        this.$progressBar = $footer.find("#progressbar");
        this.$progressBar
            .attr('data-slider-value', 0)
            .attr('data-slider-max', this.states.length);

        // @ts-ignore
        this.$progressBar.slider('destroy')
            .slider()
            .on('slide', (slideEvt: { value: number }): void => {
                this.goTo(slideEvt.value);
            });
    }

    public play(): void {
        if(!this.isPaused()) {
            window.clearInterval(this.playerInterval);
            this.playerInterval = null;
        }

        this.playerInterval = window.setInterval((): void => {
            this.redrawFunction();
            this.goTo(this.currentState + 1);

            if (this.currentState >= this.states.length) {
                this.pause();
                this.finishedPlayingCallback();
            }
        }, 20);
        this.playCallback();
    }

    public pause(): void {
        window.clearInterval(this.playerInterval);
        this.playerInterval = null;
        this.pauseCallback();
    }

    public isPaused(): boolean {
        return !this.playerInterval;
    }

    public goTo(position: number): void {
        this.$footer.find('.progressbar-current').text(position);
        this.$progressBar.attr('data-slider-value', position);
        // @ts-ignore
        this.$progressBar.slider('setValue', position);
        this.currentState = position;

        if(this.isPaused()) {
            this.redrawFunction();
        }
    }

    public destroy(): void {
        if(!this.isPaused()) {
            this.pause();
        }

        for (let key in this.fluidsToSimulate) {
            this.fluidsToSimulate[key].remove(this.canvas);
        }
    }

    private redrawFunction(): void {
        this.states[this.currentState].dropletStates.forEach((value): void => {
            let injectionTime = value.dropletInjectionTime;
            //TODO: determine color from injection data

            let dropletName = value.name;
            if (!this.fluidsToSimulate[dropletName]) {
                this.fluidsToSimulate[dropletName] = new SimulatedFluid(null, 0, null, 0);
            }

            if (value.dropletPositions.length === 1) {
                let dropletPosition = value.dropletPositions[0];
                let channel = this.getLineFromCoords(dropletPosition.edge);

                this.fluidsToSimulate[dropletName].changePosition(
                    channel,
                    dropletPosition.headPosition,
                    channel,
                    dropletPosition.tailPosition,
                );
            } else if (value.dropletPositions.length === 2) {
                let channel1 = this.getLineFromCoords(value.dropletPositions[0].edge);
                let channel2 = this.getLineFromCoords(value.dropletPositions[1].edge);

                this.fluidsToSimulate[dropletName].changePosition(
                    channel1,
                    value.dropletPositions[0].tailPosition,
                    channel2,
                    value.dropletPositions[1].headPosition,
                );
            } else if (value.dropletPositions.length === 0) {
                this.fluidsToSimulate[dropletName].remove(this.canvas);
                delete this.fluidsToSimulate[dropletName];
            } else {
                // TODO: implement multi channel spanning droplets
                debugger;
                this.fluidsToSimulate[dropletName].remove(this.canvas);
                delete this.fluidsToSimulate[dropletName];
            }
        });

        for (let key in this.fluidsToSimulate) {
            this.fluidsToSimulate[key].draw(this.canvas);
        }
    }

    private getLineFromCoords(coords: { x1: number; x2: number; y1: number; y2: number }): fabric.Line {
        return this.canvas.getObjects('line')
            .filter((value: any): boolean => value.represents === 'line')
            .filter((value: fabric.Line): boolean => value.x1 === coords.x1)
            .filter((value: fabric.Line): boolean => value.x2 === coords.x2)
            .filter((value: fabric.Line): boolean => value.y1 === coords.y1)
            .filter((value: fabric.Line): boolean => value.y2 === coords.y2)[0] as fabric.Line;
    }
}


