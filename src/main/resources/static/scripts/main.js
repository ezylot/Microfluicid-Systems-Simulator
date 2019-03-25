let fluids = [];
let droplets = [];

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: droplet sequence duplicate function
    // TODO: droplet sequence clone function
    // TODO: droplet sequence save function
    // TODO: cancel drawing on escape
    // TODO: cant remove last line by putting cirlces on top of each other
    // TODO: add pumps and drains
    // TODO: design for available elements
    // TODO: make selectable group movable
    // TODO: save and load
    // TODO: zoom in and out
});
