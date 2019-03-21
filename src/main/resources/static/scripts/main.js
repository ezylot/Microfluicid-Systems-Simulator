$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: Start drawing on grid
    // TODO: refactor del key with line.startCircle and start.endCircle
    // TODO: delete lines if start and end are same
    // TODO: cancel drawing on escape
    // TODO: droplet sequence
    // TODO: add other element types
    // TODO: design for available elements
    // TODO: make selectable group movable
    // TODO: save and load
    // TODO: zoom in and out
});
