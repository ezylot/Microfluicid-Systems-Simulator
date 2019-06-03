$(document).ready(() => {
    $('.footer #progressbar').slider().on('slide', function (slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    $('.footer .fa-play').click(event => {
        startSimulation();
    });
});

function startSimulation() {
    let json = getSaveAsJson();
    $.post('/simulate', json, function (data) {
        console.log(data);
    });
}
