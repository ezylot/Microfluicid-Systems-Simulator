$(document).ready(() => {
    let nextId = 0;

    $('#newDropletModal').on('shown.bs.modal', () => {
        $(this).find('[autofocus]').focus();
    });

    $('#newDropletModal').on('submit', event => {
        event.preventDefault();

        let newDropletName = $('#newDropletModal #newDropletName');
        let newDropletVolume = $('#newDropletModal #newDropletVolume');

        let newDroplet = {
            id: nextId++,
            name: newDropletName.val(),
            volume: newDropletVolume.val()
        };

        createNewDroplet(newDroplet, droplets);

        // Clean up modal
        $('#newDropletModal').modal('hide');

        newDropletName.val('');
        newDropletVolume.val('');
    });

    $('.droplet-properties .copy-button').on('click', (element) => {
        if(!$(element.currentTarget).is('.disabled')) {
            $('#copyDropletModal').modal('show')
        }
    });

    $('.droplet-properties .delete-button').on('click', () => {
        let $activeRow = $('.droplet-properties .table-wrapper tr.active');
        let dropletToDelete = $activeRow.data('droplet');
        droplets.splice(droplets.indexOf(dropletToDelete), 1);
        resetDropletSelection();
        $activeRow.remove();

        $('#newDropletSelection option[value=\"' + dropletToDelete.id + '\"]').remove();
        $('#dropletSelection option[value=\"' + dropletToDelete.id + '\"]').remove();

        dropletInjections.forEach(value => {
            if(value.dropletId === dropletToDelete.id) {
                value.dropletId = null;
            }
        })
    });

    $('#copyDropletModalForm').on('submit', (event) => {
        event.preventDefault();

        let $activeRow = $('.droplet-properties .table-wrapper tr.active');
        let dropletToCopy = $activeRow.data('droplet');
        let newDroplet = Object.assign({}, dropletToCopy);
        let $nameInput = $('#newDropletFromCopyName');

        newDroplet.id = nextId++;
        newDroplet.name = $nameInput.val();

        createNewDroplet(newDroplet, droplets);

        $('#copyDropletModal').modal('hide');
        $nameInput.val('');
    });

    $('.droplet-properties input').on('input', (event) => {
        let $activeRow = $('.droplet-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet = $activeRow.data('droplet');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        activeDroplet[inputName] = $inputField.val();
    });
});

function createNewDroplet(newDroplet, droplets) {
    droplets.push(newDroplet);

    let $tableBody = $('.droplet-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td></td>').text(newDroplet.id));
    $tableRow.append($('<td></td>').text(newDroplet.name));
    $tableBody.append($tableRow);
    $tableRow.data('droplet', newDroplet);

    $tableRow.on('click', () => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $dropletProperties = $('.droplet-properties');
        $dropletProperties.find('.copy-button').removeClass('disabled');
        $dropletProperties.find('.delete-button').removeClass('disabled');
        $dropletProperties.find('input[name="volume"]').val(newDroplet.volume);
    });

    $tableRow.click();
    $('.droplet-properties .copy-button').removeClass('disabled');
    $('.droplet-properties .delete-button').removeClass('disabled');

    $('#newDropletSelection').append($('<option>').attr('value', newDroplet.id).text(newDroplet.name));
    $('#dropletSelection').append($('<option>').attr('value', newDroplet.id).text(newDroplet.name));
}

function resetDropletSelection() {
    let $dropletProperties = $('.droplet-properties');
    $dropletProperties.find('.table-wrapper').find('.active').removeClass('active');

    $dropletProperties.find('.copy-button').addClass('disabled');
    $dropletProperties.find('.delete-button').addClass('disabled');

    $dropletProperties.find('input[name="volume"]').val('');
}
