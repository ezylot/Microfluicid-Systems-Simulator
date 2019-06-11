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
    'language-switcher',
    'fluids',
    'phases',
    'droplets',
    'dropletInjections',
    'save-manager',
    'Footer',
]);
