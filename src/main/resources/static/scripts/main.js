$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });

    // TODO: resize changes grid
    // TODO: create new pipe when clicking element in palette
    // TODO: del to delete line
    // TODO: droplet sequence
    // TODO: add other element types
    // TODO: design for available elements
    // TODO: delete lines if start and end are same
    // TODO: make selectable group movable
});
