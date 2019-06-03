let canvasToSave = null;
let fluids = [];
let pumps = [];
let droplets = [];
let dropletInjections = [];

let defaultValues = { };

resetValues();

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    // TODO: replace one pump with another
    // TODO: width and length from actual coordinates (can be unlocked for arbitary positioning)
    // TODO: Unassign droplet fluid on delete of pump
    // TODO: design for available elements
    // TODO: fast drawing destroys connections
});

function resetValues() {
    fluids = [];
    pumps = [];
    droplets = [];
    dropletInjections = [];

    defaultValues = {
        length: 0,
        width: 16,
        height: 0,
        pressure: 0,
        volume: 0,
    };
}
