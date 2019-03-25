$(document).ready(() => {
    let nextId = 0;

    $('#newDropletForm').on('submit', event => {
        event.preventDefault();

        let $newDropletInjectionTime = $('#newDropletInjectionTime');
        let $newFluidType = $('#newFluidType');
        let $newPumpSelection = $('#newPumpSelection');

        let newDroplet = {
            id: nextId++,
            injectionTime: $newDropletInjectionTime.val(),
            fluidId: $newFluidType.val(),
            fluidName: $newFluidType.find('>option:selected').text(),
            pumpId: $newPumpSelection.val(),
            pumpName: $newPumpSelection.find('>option:selected').text(),
        };

        createNewDroplet(newDroplet, droplets);

        // Clean up modal
        $('#newDropletForm').modal('hide');
        $newDropletInjectionTime.val('');
        $newFluidType.val('');
        $newPumpSelection.val('');
    });
});

function createNewDroplet(newDroplet, droplets) {
    droplets.push(newDroplet);

    let $tableBody = $('.sequence-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td></td>').text(newDroplet.id));
    $tableRow.append($('<td></td>').data('fluidId', newDroplet.fluidId).text(newDroplet.fluidName));
    $tableRow.append($('<td></td>').text(newDroplet.injectionTime));
    $tableRow.append($('<td></td>').data('pumpId', newDroplet.pumpId).text(newDroplet.pumpName));
    $tableBody.append($tableRow);
    $tableRow.data('droplet', newDroplet);

    $tableRow.on('click', () => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $dropletPropertiesWindow = $('.sequence-properties');
        $dropletPropertiesWindow.find('.copy-button').removeClass('disabled');
        $dropletPropertiesWindow.find('.delete-button').removeClass('disabled');

        $dropletPropertiesWindow.find('input[name="injectionTime"]').val(newDroplet.injectionTime);
        $dropletPropertiesWindow.find('select[name="pumpSelection"]').val(newDroplet.pumpId);
        $dropletPropertiesWindow.find('select[name="fluidType"]').val(newDroplet.fluidId);
    });

    $tableRow.click();
    $('.fluid-properties .copy-button').removeClass('disabled');
    $('.fluid-properties .delete-button').removeClass('disabled');
}