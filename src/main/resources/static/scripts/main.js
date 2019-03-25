let fluids = [];
let droplets = [];

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: Unassign droplet fluid on delete of fluid
    // TODO: add pumps and drains
    // TODO: design for available elements
    // TODO: save and load
});
