$(document).ready(() => {
    let nextId = 0;

    $('#newFluidModal').on('shown.bs.modal', () => {
        $(this).find('[autofocus]').focus();
    });

    $('#newFluidForm').on('submit', event => {
        event.preventDefault();

        let newFluidName = $('#newFluidForm #newFluidName');
        let newMu = $('#newFluidForm input[name="newMu"]');
        let newDensityC = $('#newFluidForm input[name="newDensityC"]');

        let newFluid = {
            id: nextId++,
            name: newFluidName.val(),
            mu: newMu.val(),
            densityC: newDensityC.val(),
        };

        createNewFluid(newFluid, fluids);

        // Clean up modal
        $('#newFluidModal').modal('hide');
        newFluidName.val('');
        newMu.val('');
        newDensityC.val('');
    });

    $('.fluid-properties .copy-button').on('click', (element) => {
        if(!$(element.currentTarget).is('.disabled')) {
            $('#copyFluidModal').modal('show')
        }
    });

    $('.fluid-properties .delete-button').on('click', () => {
        let $activeRow = $('.fluid-properties .table-wrapper tr.active');
        let fluidToDelete = $activeRow.data('fluid');
        fluids.splice(fluids.indexOf(fluidToDelete), 1);
        resetFluidSelection();
        $activeRow.remove();

        $('#contPhaseFluid option[value=\"' + fluidToDelete.id + '\"]').remove();
        $('#disptPhaseFluid option[value=\"' + fluidToDelete.id + '\"]').remove();

        // TODO: remove fluids from phase properties
    });

    $('#copyFluidModalForm').on('submit', (event) => {
        event.preventDefault();

        let $activeRow = $('.fluid-properties .table-wrapper tr.active');
        let fluidToCopy = $activeRow.data('fluid');
        let newFluid = Object.assign({}, fluidToCopy);
        let $nameInput = $('#newFluidFromCopyName');

        newFluid.id = nextId++;
        newFluid.name = $nameInput.val();

        createNewFluid(newFluid, fluids);

        $('#copyFluidModal').modal('hide');
        $nameInput.val('');
    });

    $('.fluid-properties input').on('input', (event) => {
        let $activeRow = $('.fluid-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeFluid = $activeRow.data('fluid');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        activeFluid[inputName] = $inputField.val();
    });
});

function createNewFluid(newFluid, fluids) {
    fluids.push(newFluid);

    let $tableBody = $('.fluid-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td></td>').text(newFluid.id));
    $tableRow.append($('<td></td>').text(newFluid.name));
    $tableBody.append($tableRow);
    $tableRow.data('fluid', newFluid);

    $tableRow.on('click', () => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $fluidPropertiesWindow = $('.fluid-properties');
        $fluidPropertiesWindow.find('.copy-button').removeClass('disabled');
        $fluidPropertiesWindow.find('.delete-button').removeClass('disabled');
        $fluidPropertiesWindow.find('input[name="mu"]').val(newFluid.mu);
        $fluidPropertiesWindow.find('input[name="densityC"]').val(newFluid.densityC);
    });

    $tableRow.click();
    $('.fluid-properties .copy-button').removeClass('disabled');
    $('.fluid-properties .delete-button').removeClass('disabled');


    $('#contPhaseFluid').append($('<option>').attr('value', newFluid.id).text(newFluid.name));
    $('#disptPhaseFluid').append($('<option>').attr('value', newFluid.id).text(newFluid.name));
}

function resetFluidSelection() {
    let $fluidProperties = $('.fluid-properties');
    $fluidProperties.find('.table-wrapper').find('.active').removeClass('active');

    $fluidProperties.find('.copy-button').addClass('disabled');
    $fluidProperties.find('.delete-button').addClass('disabled');

    $fluidProperties.find('input[name="mu"]').val('');
    $fluidProperties.find('input[name="densityC"]').val('');
}
