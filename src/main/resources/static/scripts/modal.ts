import * as $ from "jquery";

$(document).on('show.bs.modal', (event) => {
    $(event.target).find('input, select').val('');
    $(event.target).find('.validation').remove();
});

$(document).on('shown.bs.modal', (event) => {
    $(event.target).find('[autofocus]').trigger('focus');
});
