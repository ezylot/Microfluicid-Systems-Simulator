function loadSimulation() {
    let json = getSaveAsJson();

    return jQuery.ajax({
        'type': 'POST',
        'url': '/simulate',
        'contentType': 'application/json; charset=utf-8',
        'data': json,
        'dataType': 'json',
        'error': function (response) {
            if (response.status === 422 && response.responseJSON.status === "error") {
                new Toast("Error from server", response.responseJSON.status, response.responseJSON.message).show();
            } else if(response.status === 500 && response.responseJSON.error === "Internal Server Error"){
                console.error("Unknown error while communicating with simulator server", response);
                new Toast("Error from server", response.responseJSON.error, response.responseJSON.message).show();
            } else {
                new Toast("Unknown error from server. More details in developer console or in the server logs").show();
            }
        }
    });
}


$(document).ready(() => {
    $('.footer #progressbar').slider();

    $('.footer .start-simulate').click(() => {

        if(!!simulator) {
            simulator.destroy();
        }

        loadSimulation().then(data => {
            simulator = new Simulator(data, $('.footer'), canvasToSave, {
                finishedPlayingCallback: () => {
                    $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                    simulator.goTo(0);
                },
                playCallback: () => {
                    $('.fa-rev').removeClass('fab fa-rev').addClass('fas fa-pause');
                },
                pauseCallback: () => {
                    $('.fa-pause').removeClass('fas fa-pause').addClass('fab fa-rev');
                }
            });

            simulator.goTo(0);
            simulator.play();
        });
    });

    $('.footer')
        .on('click', '.fa-pause', event => {
            simulator.pause();
        })
        .on('click', '.fa-rev', () => {
            simulator.play();
        })
        .on('click', '.fa-caret-right', () => {
            simulator.goTo(simulator.getCurrentState() + 1);
        })
        .on('click', '.fa-caret-left', () => {
            simulator.goTo(simulator.getCurrentState() - 1);
        });
});
