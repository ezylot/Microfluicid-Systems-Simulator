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

        if(inputName === 'volume') {
            $activeRow.find('.volume').text(formatVolume(activeDroplet.volume));
        }

        if(inputName === 'name') {
            $activeRow.find('.name').text(activeDroplet.name);
        }

        updateDroplet(activeDroplet);
    });
});

function createNewDroplet(newDroplet, droplets) {
    droplets.push(newDroplet);

    let $tableBody = $('.droplet-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td class="id"></td>').text(newDroplet.id));
    $tableRow.append($('<td class="name"></td>').text(newDroplet.name));
    $tableRow.append($('<td class="volume"></td>').text(formatVolume(newDroplet.volume)));
    $tableBody.append($tableRow);
    $tableRow.data('droplet', newDroplet);

    $tableRow.on('click', () => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $dropletProperties = $('.droplet-properties');
        $dropletProperties.find('.copy-button').removeClass('disabled');
        $dropletProperties.find('.delete-button').removeClass('disabled');
        $dropletProperties.find('input[name="name"]').val(newDroplet.name);
        $dropletProperties.find('input[name="volume"]').val(newDroplet.volume);
    });

    $tableRow.click();
    $('.droplet-properties .copy-button').removeClass('disabled');
    $('.droplet-properties .delete-button').removeClass('disabled');

    $('#newDropletSelection').append($('<option>')
        .text(newDroplet.name))
        .attr('value', newDroplet.id);

    $('#dropletSelection').append($('<option>').attr('value', newDroplet.id)
        .text(newDroplet.name))
        .attr('value', newDroplet.id)
}

function formatVolume(volume) {
    if(volume < 0.0001 || volume > 10E6) {
        return Number(volume).toPrecision(4);
    }
    return Number(volume).toFixed(volume.length - 2);
}

function resetDropletSelection() {
    let $dropletProperties = $('.droplet-properties');
    $dropletProperties.find('.table-wrapper').find('.active').removeClass('active');

    $dropletProperties.find('.copy-button').addClass('disabled');
    $dropletProperties.find('.delete-button').addClass('disabled');

    $dropletProperties.find('input[name="volume"]').val('');
}
