$(document).ready(() => {
    let nextId = 0;

    $('#newDropletInjectionModal').on('shown.bs.modal', () => {
        $(this).find('[autofocus]').focus();
    });

    $('#newDropletInjectionModal').on('submit', event => {
        event.preventDefault();

        let newDroplet = $('#newDropletInjectionModal #newDropletSelection');
        let newInjectionTime = $('#newDropletInjectionModal #newDropletInjectionTime');
        let newInjectionPump = $('#newDropletInjectionModal #newPumpSelection');

        let newInjection = {
            id: nextId++,
            dropletId: newDroplet.val(),
            injectionTime: newInjectionTime.val(),
            injectionPumpId: newInjectionPump.val()
        };

        createNewInjection(newInjection, dropletInjections);

        // Clean up modal
        $('#newDropletInjectionModal').modal('hide');

        newDroplet.val('');
        newInjectionTime.val('');
        newInjectionPump.val('');
    });

    $('.injection-properties .copy-button').on('click', (element) => {
        if(!$(element.currentTarget).is('.disabled')) {
            let $activeRow = $('.injection-properties .table-wrapper tr.active');
            let injectionToCopy = $activeRow.data('injection');
            let newInjection = Object.assign({}, injectionToCopy);
            let $nameInput = $('#newInjectionFromCopyName');

            newInjection.id = nextId++;

            createNewInjection(newInjection, dropletInjections);
        }
    });

    $('.injection-properties .delete-button').on('click', () => {
        let $activeRow = $('.injection-properties .table-wrapper tr.active');
        let injectionToDelete = $activeRow.data('injection');
        dropletInjections.splice(dropletInjections.indexOf(injectionToDelete), 1);
        resetInjectionSelection();
        $activeRow.remove();
    });

    $('.injection-properties input').on('input', (event) => {
        let $activeRow = $('.injection-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeInjection = $activeRow.data('injection');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        activeInjection[inputName] = $inputField.val();
        if(inputName === 'injectionTime') {
            $activeRow.find('.injectionTime').text(activeInjection.injectionTime);
        }
    });

    $('.injection-properties select').on('change', (event) => {
        let $activeRow = $('.injection-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeInjection = $activeRow.data('injection');
        let $select = $(event.target);
        let inputName = $select.attr('name');

        activeInjection[inputName] = $select.val();

        if(inputName === 'injectionPumpId') {
            $activeRow.find('.injectionPumpId').text(activeInjection.injectionPumpId);
        }

        if(inputName === 'dropletId') {
            $activeRow.find('.dropletId').text(activeInjection.dropletId);
        }
    });
});

function createNewInjection(newInjection, injections) {
    injections.push(newInjection);

    let $tableBody = $('.injection-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td class="id"></td>').text(newInjection.id));
    $tableRow.append($('<td class="dropletId"></td>').text(newInjection.dropletId));
    $tableRow.append($('<td class="injectionTime"></td>').text(newInjection.injectionTime));
    $tableRow.append($('<td class="injectionPumpId"></td>').text(newInjection.injectionPumpId));
    $tableBody.append($tableRow);
    $tableRow.data('injection', newInjection);

    $tableRow.on('click', () => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $dropletProperties = $('.injection-properties');
        $dropletProperties.find('.copy-button').removeClass('disabled');
        $dropletProperties.find('.delete-button').removeClass('disabled');
        $dropletProperties.find('select[name="injectionPumpId"]').val(newInjection.injectionPumpId);
        $dropletProperties.find('select[name="dropletId"]').val(newInjection.dropletId);
        $dropletProperties.find('input[name="injectionTime"]').val(newInjection.injectionTime);
    });

    $tableRow.click();
}

function resetInjectionSelection() {
    let $dropletProperties = $('.droplet-properties');
    $dropletProperties.find('.table-wrapper').find('.active').removeClass('active');

    $dropletProperties.find('.copy-button').addClass('disabled');
    $dropletProperties.find('.delete-button').addClass('disabled');

    $dropletProperties.find('select[name="fluidId"]').val('');
    $dropletProperties.find('input[name="volume"]').val('');
}
