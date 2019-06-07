let canvasToSave = null;
let fluids = [];
let pumps = [];
let droplets = [];
let dropletInjections = [];
let states = [];


let phaseProperties = { };
let defaultValues = { };

resetValues();

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    // TODO: Add fields to fluid table
    // TODO: possibility to define "complete" channels in fluid simumlation
    // TODO: Color at droplet properties
    // TODO: injection table: use names instead of ids
    // TODO: disable property input fields until selection is made
    // TODO: switch zoom direction
    // TODO: fix pump selection/highlight color
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
    states = [];

    defaultValues = {
        width: 16,
        height: 16,
        pressure: 0,
        volume: 0,
    };
}
