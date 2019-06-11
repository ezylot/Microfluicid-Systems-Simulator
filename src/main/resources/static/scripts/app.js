// TODO: Add fields to fluid table
// TODO: possibility to define "fully filled with fluid" channels in fluid simmulation
// TODO: Color at droplet properties
// TODO: disable property input fields until selection is made
// TODO: fix pump selection/highlight color
// TODO: save/replace width/height/length not working (always default value)
// TODO: replace one pump with another
// TODO: Unassign droplet fluid on delete of pump
// TODO: design for available elements
// TODO: fast drawing destroys connections

let canvasToSave = null;
let fluids = [];
let pumps = [];

require(['Footer', 'jquery', 'bootstrap', 'bootstrap-slider'], function (footer, $) {
    jQuery(() => {
        // @ts-ignore
        footer.Footer.getInstance().initFooter(canvasToSave);
        $('[data-toggle="tooltip"]').tooltip();

        $('.modal').on('hidden.bs.modal', function () {
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });

    });
});

require([
    'language-switcher',
    'phases',
    'droplet-manager',
    'dropletInjections'
]);


require(['defaultvalue-manager'], (def) => {
    function resetValues() {
        fluids = [];
        pumps = [];
        droplets = [];
        dropletInjections = [];

        def.setDefaultValues(def.defaultDefaultValues);
    }
    resetValues();

    // TODO: remove after converting
    window.resetValues = resetValues;
});
