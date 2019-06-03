let canvasToSave = null;
let fluids = [];
let pumps = [];
let droplets = [];
let dropletInjections = [];

let defaultValues = { };

resetValues();

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    // TODO: save/replace width/height/length not working (always default value)
    // TODO: replace one pump with another
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
        width: 16,
        height: 16,
        pressure: 0,
        volume: 0,
    };
}
