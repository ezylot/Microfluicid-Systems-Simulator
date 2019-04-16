$(document).ready(() => {
    let nextId = 0;

    $('#newDropletForm').on('submit', event => {
        event.preventDefault();

        let $newDropletInjectionTime = $('#newDropletInjectionTime');
        let $newFluidType = $('#newFluidType');
        let $newPumpSelection = $('#newPumpSelection');
        let $pOrHRadios = $('#newDropletForm [name="type"]:checked');

        let newDroplet = {
            id: nextId++,
            injectionTime: $newDropletInjectionTime.val(),
            fluidId: $newFluidType.val(),
            fluidName: $newFluidType.find('>option:selected').text(),
            pumpId: $newPumpSelection.val(),
            pumpName: $newPumpSelection.find('>option:selected').text(),
            pOrH: $pOrHRadios.val(),
        };

        createNewDroplet(newDroplet, droplets);

        // Clean up modal
        $('#newDropletModal').modal('hide');
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
        let dropletToDelete = $activeRow.data('droplet');
        droplets.splice(droplets.indexOf(dropletToDelete), 1);
        resetDropletSelection();
        $activeRow.remove();
    });

    $('.sequence-properties input[name="injectionTime"]').on('input', (event) => {
        let $activeRow = $('.sequence-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet = $activeRow.data('droplet');
        let $inputField = $(event.target);
        activeDroplet.injectionTime = $inputField.val();
        $activeRow.find('[data-attr="injectionTime"]').html($inputField.val());
    });

    $('.sequence-properties input[name="type"]').on('input', (event) => {
        let $activeRow = $('.sequence-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet = $activeRow.data('droplet');
        let $inputField = $(event.target);
        activeDroplet.pOrH = $inputField.val();
        $activeRow.find('[data-attr="pOrH"]').html($inputField.val());
    });

    $('.sequence-properties #fluidType').on('change', (event) => {
        let $activeRow = $('.sequence-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet = $activeRow.data('droplet');
        let $select = $(event.target);

        activeDroplet.fluidId = $select.val();
        activeDroplet.fluidName = $select.find('>option:selected').text();
        $activeRow.find('[data-attr="fluid"]')
            .data('fluidId', $select.val())
            .html($select.find('>option:selected').text());
    });

    $('.sequence-properties #pumpSelection').on('change', (event) => {
        let $activeRow = $('.sequence-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet = $activeRow.data('droplet');
        let $select = $(event.target);

        activeDroplet.pumpId = $select.val();
        activeDroplet.pumpName = $select.find('>option:selected').text();
        $activeRow.find('[data-attr="pump"]')
            .data('pumpId', $select.val())
            .html($select.find('>option:selected').text());
    });
});

function createNewDroplet(newDroplet, droplets) {
    droplets.push(newDroplet);

    let $tableBody = $('.sequence-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td></td>').attr('data-attr', "id").text(newDroplet.id));
    $tableRow.append($('<td></td>').attr('data-attr', "fluid").data('fluidId', newDroplet.fluidId).text(newDroplet.fluidName));
    $tableRow.append($('<td></td>').attr('data-attr', "injectionTime").text(newDroplet.injectionTime));
    $tableRow.append($('<td></td>').attr('data-attr', "pump").data('pumpId', newDroplet.pumpId).text(newDroplet.pumpName));
    $tableRow.append($('<td></td>').attr('data-attr', "pOrH").data('pOrH', newDroplet.pOrH).text(newDroplet.pOrH));
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

        $dropletPropertiesWindow.find('input[name="type"]').prop('checked', null); // First reset selection
        $dropletPropertiesWindow.find('input[name="type"][value="'+newDroplet.pOrH+ '"]').prop('checked', true);

        $('.sequence-properties #pumpSelection').val(newDroplet.pumpId);
        $('.sequence-properties #fluidType').val(newDroplet.fluidId);
    });

    $tableRow.click();
    $('.sequence-properties .copy-button').removeClass('disabled');
    $('.sequence-properties .delete-button').removeClass('disabled');
}

function resetDropletSelection() {
    let $sequenceProperties = $('.sequence-properties');
    $sequenceProperties.find('.table-wrapper').find('.active').removeClass('active');

    $sequenceProperties.find('.copy-button').addClass('disabled');
    $sequenceProperties.find('.delete-button').addClass('disabled');

    $sequenceProperties.find('input[name="injectionTime"]').val('');
    $sequenceProperties.find('input[name="type"]').prop('checked', null);
}