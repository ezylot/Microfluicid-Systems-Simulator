import {Toast} from "./classes/Toast";
import {Simulator} from "./classes/Simulator";
import * as $ from 'jquery';
import 'bootstrap'
import 'bootstrap-slider'
import {Canvas} from "fabric/fabric-impl";
import {getSaveAsJson} from "./save-manager";
import {canvasToSave} from "./workspace";

export class Footer {
    private simulator: Simulator;
    private ajaxRequest: JQuery.jqXHR;

    private static instance: Footer;
    private constructor() { }

    public static getInstance(): Footer {
        if (!Footer.instance) {
            Footer.instance = new Footer();
        }
        return Footer.instance;
    }

    public resetSimulator(): void {
        if(!!this.simulator) {
            this.simulator.destroy();
        }
    }

    public getJsonFromServer(): JQuery.jqXHR {
        let json = getSaveAsJson();

        return jQuery.ajax({
            'type': 'POST',
            'url': '/simulate',
            'contentType': 'application/json; charset=utf-8',
            'data': json,
            'dataType': 'json',
            'error': (response): void => {
                if (response.status === 422 && response.responseJSON.status === "error") {
                    new Toast("Error from server", response.responseJSON.status, response.responseJSON.message).show();
                } else if(response.status === 500 && response.responseJSON.error === "Internal Server Error"){
                    console.error("Unknown error while communicating with simulator server", response);
                    new Toast("Error from server", response.responseJSON.error, response.responseJSON.message).show();
                } else {
                    new Toast("Unknown", "", "Unknown error from server. More details in developer console or in the server logs").show();
                }
            }
        });
    }

    public initFooter(canvas: Canvas): void {
        // @ts-ignore
        $('.footer #progressbar').slider();
        $('.footer .start-simulate').on('click', (): void => {
            this.resetSimulator();
            if(!!this.ajaxRequest) {
                this.ajaxRequest.abort();
            }

            this.ajaxRequest = this.getJsonFromServer();
            this.ajaxRequest.then((data): void => {
                this.simulator = new Simulator(data, $('.footer'), canvas, {
                    finishedPlayingCallback: (): void => {
                        $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                        this.simulator.goTo(0);
                    },
                    playCallback: (): void => {
                        $('.fa-rev').removeClass('fab fa-rev').addClass('fas fa-pause');
                    },
                    pauseCallback: (): void => {
                        $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                    }
                });

                this.simulator.goTo(0);
                this.simulator.play();
            });
        });

        $('.footer')
            .on('click', '.fa-pause', (): void => {
                this.simulator.pause();
            })
            .on('click', '.fa-rev', (): void => {
                this.simulator.play();
            })
            .on('click', '.fa-caret-right', (): void => {
                this.simulator.goTo(this.simulator.currentState + 1);
            })
            .on('click', '.fa-caret-left', (): void => {
                this.simulator.goTo(this.simulator.currentState - 1);
            });
    }
}


jQuery((): void => {
    Footer.getInstance().initFooter(canvasToSave);
});
