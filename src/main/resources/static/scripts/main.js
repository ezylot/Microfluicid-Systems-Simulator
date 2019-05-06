let fluids = [];
let pumps = [];
let droplets = [];

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: default values for channels
    // TODO: droplets as a rectangle and 2 half circles
    // TODO: width and length from actual coordiantes (can be unlocked for arbitary positioning)
    // TODO: "fluid classes" / combinations
    // TODO: Unassign droplet fluid on delete of fluid
    // TODO: Unassign droplet fluid on delete of pump
    // TODO: design for available elements
    // TODO: save and load
    // TODO: fast drawing destroys connections
});
