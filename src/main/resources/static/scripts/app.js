/*
 TODO: possibility to define "fully filled with fluid" channels in fluid simmulation
 TODO: design for available elements
 TODO: fast drawing destroys connections
 TODO: Lock Corners while simulator is started
 TODO: Look over translations/clean up
 TODO: Change mouse pointer depending on selected element in the element palette
 TODO: Select next entry when deleting (? do not know if really better this way)
 TODO: fluid names should be unique
 TODO: droplet names should be unique
 TODO: pump names should be unique
 TODO: Open dialog when downloading to let user select download location/name
 TODO: look at zooming in firefox
 TODO: Info tooltip at volume input
 TODO: Default Values from Volume Pump
 TODO: Units for Volume pump
 TODO: Units for Pressure pump
 TODO: Multi select channels
 TODO: Info Texts for the available elements
 TODO: look at functionality of traps
 TODO: Show error messages longer
 TODO: Add grid size multiplier in default values
 TODO: About link "Created with JKU, etc"
*/

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
