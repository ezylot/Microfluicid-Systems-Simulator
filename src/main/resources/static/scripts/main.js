$(document).ready(() => {
    $('.footer #progressbar').slider().on('slide', function(slideEvt) {
        $('.footer .progressbar-current').text(slideEvt.value);
    });
});
