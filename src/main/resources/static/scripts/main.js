let canvasToSave = null;
let fluids = [];
let pumps = [];
let droplets = [];
let dropletInjections = [];

let defaultValues = {
    length: 0,
    width: 0,
    height: 0,
    pressure: 0,
    volume: 0,
};

$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();
    // TODO: save and load

    // TODO: replace one pump with another
    // TODO: cancel pump draw with escape
    // TODO: mouse icon when drawing a pump
    // TODO: droplets as a rectangle and 2 half circles
    // TODO: width and length from actual coordinates (can be unlocked for arbitary positioning)
    // TODO: Unassign droplet fluid on delete of pump
    // TODO: design for available elements
    // TODO: fast drawing destroys connections
});
