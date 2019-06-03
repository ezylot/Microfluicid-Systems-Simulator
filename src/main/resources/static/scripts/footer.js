let playerInterval = null;
let currentFrame = null;
let maxFrame = 0;
let fluidsInLastState = [];

$(document).ready(() => {
    $('.footer .fa-play').click(event => {
        if(!!playerInterval) {
            window.clearInterval(playerInterval);
            playerInterval = null;
        }

        startSimulation().then(value => {
            fluidsInLastState = [];
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
});

function goTo(val) {
    $('.footer #progressbar').attr('data-slider-value', val);
    currentFrame = val;
}

function play() {
    if(!!playerInterval) {
        window.clearInterval(playerInterval);
        playerInterval = null;
    }

    playerInterval = window.setInterval(() => {
        if(currentFrame === maxFrame) {
            window.clearInterval(playerInterval);
            playerInterval = null;
            return;
        }

        let currentFrameObject = states[currentFrame];

        fluidsInLastState.forEach(value => value.remove(canvasToSave));
        fluidsInLastState = [];
        currentFrameObject.dropletStates.forEach(value => {
            let injectionTime = value.dropletInjectionTime;
            //TODO: determine color from injection data

            let simulatedFluid1 = null;
            if(value.dropletPositions.length === 1) {
                let dropletPosition = value.dropletPositions[0];
                let channel = getLineFromCoords(canvasToSave, dropletPosition.edge);
                simulatedFluid1 = new SimulatedFluid(
                    channel,
                    dropletPosition.headPosition,
                    channel,
                    dropletPosition.tailPosition,
                );
            } else if(value.dropletPositions.length === 2) {
                let channel1 = getLineFromCoords(canvasToSave, value.dropletPositions[0].edge);
                let channel2 = getLineFromCoords(canvasToSave, value.dropletPositions[1].edge);
                simulatedFluid1 = new SimulatedFluid(
                    channel1,
                    value.dropletPositions[0].tailPosition,
                    channel2,
                    value.dropletPositions[1].headPosition,
                );
            } else {
                currentFrame++;
                return;
                // TODO: implement multi channel spanning droplets
            }

            simulatedFluid1.draw(canvasToSave);
            fluidsInLastState.push(simulatedFluid1);
        });
        currentFrame++;
    }, 50);
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
