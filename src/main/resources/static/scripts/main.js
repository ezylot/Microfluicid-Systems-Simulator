let fluids = [];
let pumps = [];
let droplets = [];
let dropletSequence = [];

let defaultValues = {
    length: 0,
    width: 0,
    height: 0,
    pressure: 0,
    volume: 0,
};

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: fluids -> droplets -> droplet-injection
    // TODO: droplets as a rectangle and 2 half circles
    // TODO: width and length from actual coordinates (can be unlocked for arbitary positioning)
    // TODO: Unassign droplet fluid on delete of fluid
    // TODO: Unassign droplet fluid on delete of pump
    // TODO: design for available elements
    // TODO: save and load
    // TODO: fast drawing destroys connections
});
