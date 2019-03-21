$(document).ready(() => {
    let fluids = [];

    $('#newFluidModal').on('shown.bs.modal', () => {
        $(this).find('[autofocus]').focus();
    });

    $('#newFluidForm').on('submit', event => {
        event.preventDefault();

        let newFluidName = $('#newFluidForm #newFluidName');
        let newMuc = $('#newFluidForm input[name="newMuc"]');
        let newMud = $('#newFluidForm input[name="newMud"]');
        let newDensityC = $('#newFluidForm input[name="newDensityC"]');
        let newInterfTens = $('#newFluidForm input[name="newInterfTens"]');
        let newSlip = $('#newFluidForm input[name="newSlip"]');

        let newFluid = {
            id: fluids.length + 1,
            name: newFluidName.val(),
            muc: newMuc.val(),
            mud: newMud.val(),
            densityC: newDensityC.val(),
            interfTens: newInterfTens.val(),
            slip: newSlip.val(),
        };
        fluids.push(newFluid);

        let $tableBody = $('.fluid-properties table tbody');
        let $tableRow = $('<tr class="active"></tr>');
        $tableRow.append($('<td></td>').text(newFluid.id));
        $tableRow.append($('<td></td>').text(newFluid.name));
        $tableRow.append($('<td><i class="fas fa-trash-alt mr-2"></i></td>'));
        $tableBody.append($tableRow);
        $tableRow.data('fluid', newFluid);

        $tableRow.click(() => {
            $tableBody.find('.active').removeClass('active');
            $tableRow.addClass('active');
            $('input[name="muc"]').val(newFluid.muc);
            $('input[name="mud"]').val(newFluid.mud);
            $('input[name="densityC"]').val(newFluid.densityC);
            $('input[name="interfTens"]').val(newFluid.interfTens);
            $('input[name="slip"]').val(newFluid.slip);
        });

        $tableRow.click();

        $('.fluid-properties .copy-button').removeClass('disabled');
        $('#newFluidModal').modal('hide');
        newFluidName.val('');
        newMuc.val('');
        newMud.val('');
        newDensityC.val('');
        newInterfTens.val('');
        newSlip.val('');
    });

    $('.fluid-properties .copy-button').click((element) => {
        if(!$(element.currentTarget).is('.disabled')) {
            $('#copyFluidModal').modal('show')
        }
    });
});
