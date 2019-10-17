/*
 TODO: possibility to define "fully filled with fluid" channels in fluid simmulation
 TODO: Select next entry when deleting (? do not know if really better this way)
 TODO: Multi select channels
 TODO: look at functionality of traps
 TODO: Add grid size multiplier in default values
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
    'save-manager',
    'workspace',
    'language-switcher',
    'droplets',
    'dropletInjections',
    'Footer',
    'modal'
], function (valueReset, fluids, phases, Fluid, PhaseProperties, saveManager) {
    valueReset.resetValues();

    //region load oil-droplets in water example data
    let water = new Fluid.Fluid(0, "Water", 0.001, 997);
    let oil = new Fluid.Fluid(1, "Oil", 0.004565, 913);
    fluids.createNewFluid(water);
    fluids.createNewFluid(oil);
    phases.setPhaseProperties(new PhaseProperties.PhaseProperties(0.012, 1.28, water.id, oil.id));

    if(window.location.search.indexOf("clear=true") === -1) {
        saveManager.loadSave('{"fluids":[{"id":0,"name":"Water","mu":0.001,"densityC":997},{"id":1,"name":"Oil","mu":0.004565,"densityC":913}],"pumps":[{"top":60,"left":340,"id":0,"pumpValue":3000,"pumpName":"P0","type":"pressure"},{"top":530,"left":340,"id":2,"pumpValue":null,"pumpName":"D2","type":"drain"}],"droplets":[{"id":0,"name":"Header","volume":1e-12,"color":"#62dbc2"},{"id":1,"name":"Payload","volume":3e-12,"color":"#1b71ac"}],"dropletInjections":[{"id":0,"dropletId":0,"injectionPumpId":0,"dropletName":"Header","injectionPumpName":"P0","injectionTime":0},{"id":1,"dropletId":0,"injectionPumpId":0,"dropletName":"Header","injectionPumpName":"P0","injectionTime":3},{"id":3,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":6},{"id":4,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":9},{"id":5,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":12},{"id":6,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":15},{"id":7,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":18},{"id":8,"dropletId":1,"injectionPumpId":0,"dropletName":"Payload","injectionPumpName":"P0","injectionTime":21}],"phaseProperties":{"_interfacialTension":0.012,"_slip":1.28,"_contPhaseFluid":0,"_disptPhaseFluid":1},"defaultValues":{"_width":16,"_height":16,"_pressure":3000,"_volume":0},"canvas":{"lines":[{"channelType":"normal","x1":340,"y1":60,"x2":340,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":140,"y1":330,"x2":140,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":140,"y1":330,"x2":340,"y2":330,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":340,"y1":330,"x2":470,"y2":330,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":470,"y1":330,"x2":470,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":340,"y1":330,"x2":340,"y2":530,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":340,"y1":160,"x2":250,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":250,"y1":160,"x2":140,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":340,"y1":160,"x2":430,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"normal","x1":430,"y1":160,"x2":470,"y2":160,"properties":{"height":16,"width":16}},{"channelType":"bypass","x1":250,"y1":160,"x2":250,"y2":210,"properties":{"height":32,"width":30}},{"channelType":"bypass","x1":250,"y1":210,"x2":430,"y2":210,"properties":{"height":32,"width":30}},{"channelType":"bypass","x1":430,"y1":210,"x2":430,"y2":160,"properties":{"height":30,"width":30}}]}}')
    }
    //endregion
});
