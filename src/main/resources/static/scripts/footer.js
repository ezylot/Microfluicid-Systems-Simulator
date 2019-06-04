let playerInterval = null;
let currentFrame = null;
let maxFrame = -1;
let fluidsToSimulate = [];

$(document).ready(() => {
    $('.footer .fa-play').click(event => {
        if(!!playerInterval) {
            window.clearInterval(playerInterval);
            playerInterval = null;
        }

        startSimulation().then(value => {
            fluidsToSimulate = [];
            maxFrame = states.length;

            $('.progressbar-max').text(states.length);
            $('.footer #progressbar')
                .attr('data-slider-value', 0)
                .attr('data-slider-max', states.length)
                .slider()
                .on('slide', function (slideEvt) {
                    goTo(slideEvt.value);
                });

            goTo(0);
            play();
        });
    });

    $('.footer').on('click', '.fa-pause', event => {
        if(maxFrame === -1) {
            return;
        }

        if(!!playerInterval) {
            window.clearInterval(playerInterval);
            playerInterval = null;
        }

        $(event.target).removeClass('fas fa-pause').addClass('fab fa-rev');
    });

    $('.footer').on('click', '.fa-rev', event => {
        $(event.target).removeClass('fab fa-rev').addClass('fas fa-pause');
        play();
    });
});

function goTo(val) {
    $('.progressbar-current').text(val);
    $('.footer #progressbar')
        .attr('data-slider-value', val)
        .slider('setValue', val);
    currentFrame = val;

    if(!playerInterval) {
        // We are currently in the pause function, so we draw only a single frame
        redrawFunction();
    }
}

function play() {
    if(!!playerInterval) {
        window.clearInterval(playerInterval);
        playerInterval = null;
    }

    playerInterval = window.setInterval(function() {
        redrawFunction();
        goTo(currentFrame + 1);
    }, 20);
}

function redrawFunction() {
    if (!!playerInterval && currentFrame >= maxFrame) {
        window.clearInterval(playerInterval);
        playerInterval = null;
        return;
    }

    states[currentFrame].dropletStates.forEach(value => {
        let injectionTime = value.dropletInjectionTime;
        //TODO: determine color from injection data

        let dropletName = value.name;
        if (!fluidsToSimulate[dropletName]) {
            fluidsToSimulate[dropletName] = new SimulatedFluid(null, 0, null, 0);
        }

        if (value.dropletPositions.length === 1) {
            let dropletPosition = value.dropletPositions[0];
            let channel = getLineFromCoords(canvasToSave, dropletPosition.edge);

            fluidsToSimulate[dropletName].changePosition(
                channel,
                dropletPosition.headPosition,
                channel,
                dropletPosition.tailPosition,
            );
        } else if (value.dropletPositions.length === 2) {
            let channel1 = getLineFromCoords(canvasToSave, value.dropletPositions[0].edge);
            let channel2 = getLineFromCoords(canvasToSave, value.dropletPositions[1].edge);

            fluidsToSimulate[dropletName].changePosition(
                channel1,
                value.dropletPositions[0].tailPosition,
                channel2,
                value.dropletPositions[1].headPosition,
            );
        } else if (value.dropletPositions.length === 0) {
            fluidsToSimulate[dropletName].remove(canvasToSave);
            delete fluidsToSimulate[dropletName];
        } else {
            // TODO: implement multi channel spanning droplets
            debugger;
            fluidsToSimulate[dropletName].remove(canvasToSave);
            delete fluidsToSimulate[dropletName];
        }
    });

    for (let key in fluidsToSimulate) {
        fluidsToSimulate[key].draw(canvasToSave);
    }
}

/**
 * @param {fabric.Canvas} canvas
 * @param {Object} coords
 */
function getLineFromCoords(canvas, coords) {
    return canvas.getObjects('line')
        .filter(value => value.represents === 'line')
        .filter(value => value.x1 === coords.x1)
        .filter(value => value.x2 === coords.x2)
        .filter(value => value.y1 === coords.y1)
        .filter(value => value.y2 === coords.y2)[0];
}

function startSimulation() {
    let json = getSaveAsJson();

    return jQuery.ajax({
        'type': 'POST',
        'url': '/simulate',
        'contentType': 'application/json; charset=utf-8',
        'data': json,
        'dataType': 'json',
        'success': function (data) {
            states = data;
        }
    });
}
