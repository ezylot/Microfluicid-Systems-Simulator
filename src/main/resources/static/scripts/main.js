$(document).ready(() => {
    $('[data-toggle="tooltip"]').tooltip();

    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });


    // TODO: fluids - move delete button to other buttons
    // TODO: fluids - save on change function
    // TODO: droplet sequence javascript part
    // TODO: cancel drawing on escape
    // TODO: add other element types
    // TODO: design for available elements
    // TODO: make selectable group movable
    // TODO: save and load
    // TODO: zoom in and out
});
