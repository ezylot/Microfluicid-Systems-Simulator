// TODO: possibility to define "fully filled with fluid" channels in fluid simmulation
// TODO: design for available elements
// TODO: fast drawing destroys connections
// TODO: Lock Corners while simulator is started
// TODO: Look over translations/clean up
// TODO: Mark the currently selected element in the element palette
// TODO: Change mouse pointer depending on selected element in the element palette
// TODO: Pump renaming test (sometimes something breaks)
// TODO: Select next entry when deleting (? do not know if really better this way)
// TODO: names should be unique
// TODO: PUMP+Injection time should be unique
// TODO: Open dialog when downloading to let user select download location/name
// TODO: Change icons of Play/Pause/Next/Previous Buttons

require(['jquery', 'bootstrap'], function ($) {
    jQuery(() => {
        $('[data-toggle="tooltip"]').tooltip();

        $('.modal').on('hidden.bs.modal', function () {
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        });
    });
});

require([
    'value-reset',
    'fluids',
    'phases',
    './classes/Fluid',
    './classes/PhaseProperties',
    'workspace',
    'language-switcher',
    'droplets',
    'dropletInjections',
    'save-manager',
    'Footer'
], function (valueReset, fluids, phases, Fluid, PhaseProperties) {
    valueReset.resetValues();

    //region load oil-droplets in water example data
    let water = new Fluid.Fluid(0, "Water", 0.001, 997);
    let oil = new Fluid.Fluid(1, "Oil", 0.004565, 913);
    fluids.createNewFluid(water);
    fluids.createNewFluid(oil);
    phases.setPhaseProperties(new PhaseProperties.PhaseProperties(0.012, 1.28, water.id, oil.id));
    //endregion
});
