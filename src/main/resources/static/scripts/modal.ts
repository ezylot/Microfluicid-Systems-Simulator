import * as $ from "jquery";

$(document).on('show.bs.modal', (event) => {
    $(event.target).find('input, select').val('');
});

$(document).on('shown.bs.modal', (event) => {
    $(event.target).find('[autofocus]').trigger('focus');
});
