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

    $('.sequence-properties .copy-button').on('click', (element) => {
        if(!$(element.currentTarget).is('.disabled')) {
            let $activeRow = $('.sequence-properties .table-wrapper tr.active');
            let dropletToCopy = $activeRow.data('droplet');
            let newDroplet = Object.assign({}, dropletToCopy);
            newDroplet.id = nextId++;

            createNewDroplet(newDroplet, droplets);
        }
    });


    $('.sequence-properties .delete-button').on('click', () => {
        let $activeRow = $('.sequence-properties .table-wrapper tr.active');
        let dropletToDelete = $activeRow.data('fluid');
        droplets.splice(droplets.indexOf(dropletToDelete), 1);
        resetDropletSelection();
        $activeRow.remove();
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

function resetDropletSelection() {
    let $fluidProperties = $('.sequence-properties');
    $fluidProperties.find('.table-wrapper').find('.active').removeClass('active');

    $fluidProperties.find('.copy-button').addClass('disabled');
    $fluidProperties.find('.delete-button').addClass('disabled');

    $fluidProperties.find('input[name="injectionTime"]').val('');
}