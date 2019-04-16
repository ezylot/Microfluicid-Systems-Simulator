let fluids = [];
let pumps = [];
let droplets = [];

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: properties for pumps
    // TODO: Unassign droplet fluid on delete of fluid
    // TODO: Unassign droplet fluid on delete of pump
    // TODO: design for available elements
    // TODO: save and load
    // TODO: zoom
    // TODO: droplet
});
