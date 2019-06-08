import {Toast} from "./classes/Toast";
import {Simulator} from "./classes/Simulator";

export class Footer {
    private _simulator: Simulator;

    private static instance: Footer;
    private constructor() { }

    public static getInstance(): Footer {
        if (!Footer.instance) {
            Footer.instance = new Footer();
        }
        return Footer.instance;
    }

    public resetSimulator(): void {
        if(!!this._simulator) {
            this._simulator.destroy();
            this._simulator = null;
        }
    }

    public get simulator(): Simulator {
        return this._simulator;
    }

    public getJsonFromServer(): JQuery.jqXHR {
        // @ts-ignore
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
}

export function initFooter(): void {
    let footer = Footer.getInstance();
    let simulator = footer.simulator;

    // @ts-ignore
    $('.footer #progressbar').slider();
    $('.footer .start-simulate').on('click', (): void => {
        Footer.getInstance().resetSimulator();
        Footer.getInstance().getJsonFromServer().then((data): void => {
            // @ts-ignore
            simulator = new Simulator(data, $('.footer'), canvasToSave, {
                finishedPlayingCallback: (): void => {
                    $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                    simulator.goTo(0);
                },
                playCallback: (): void => {
                    $('.fa-rev').removeClass('fab fa-rev').addClass('fas fa-pause');
                },
                pauseCallback: (): void => {
                    $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                }
            });

            simulator.goTo(0);
            simulator.play();
        });
    });

    $('.footer')
        .on('click', '.fa-pause', (): void => {
            simulator.pause();
        })
        .on('click', '.fa-rev', (): void => {
            simulator.play();
        })
        .on('click', '.fa-caret-right', (): void => {
            simulator.goTo(simulator.currentState + 1);
        })
        .on('click', '.fa-caret-left', (): void => {
            simulator.goTo(simulator.currentState - 1);
        });
}
