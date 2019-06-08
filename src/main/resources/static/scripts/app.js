// TODO: Add fields to fluid table
// TODO: possibility to define "complete" channels in fluid simmulation
// TODO: Color at droplet properties
// TODO: disable property input fields until selection is made
// TODO: switch zoom direction
// TODO: fix pump selection/highlight color
// TODO: save/replace width/height/length not working (always default value)
// TODO: replace one pump with another
// TODO: Unassign droplet fluid on delete of pump
// TODO: design for available elements
// TODO: fast drawing destroys connections

requirejs(['Footer', 'jquery', 'bootstrap', 'bootstrap-slider'], function (footer, $) {
    jQuery(() => {
        // @ts-ignore
        footer.Footer.getInstance().initFooter(canvasToSave);
        $('[data-toggle="tooltip"]').tooltip();
    });
});

let canvasToSave = null;
let fluids = [];
let pumps = [];
let droplets = [];
let dropletInjections = [];

let phaseProperties = { };

function resetValues() {
    fluids = [];
    pumps = [];
    droplets = [];
    dropletInjections = [];

    setDefaultValues({
        width: 16,
        height: 16,
        pressure: 0,
        volume: 0,
    })
}

resetValues();
