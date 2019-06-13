// TODO: possibility to define "fully filled with fluid" channels in fluid simmulation
// TODO: design for available elements
// TODO: fast drawing destroys connections

require(['jquery', 'bootstrap', 'bootstrap-slider'], function ($) {
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
    'Footer',
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
