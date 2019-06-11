import * as $ from "jquery";
import 'bootstrap';
import SubmitEvent = JQuery.SubmitEvent;
import {DropletInjection} from "./classes/DropletInjection";

let dropletInjections: DropletInjection[] = [];
let nextId = 0;

// TODO: change type when defined for pump
export function updatePump(updatedPump: any): void {
    let $tableRows = $('.injection-properties table tbody tr');
    $tableRows.each((index, row): void => {
        let $row = $(row);
        let dropletInjection: DropletInjection = $row.data('injection');

        if(dropletInjection.injectionPumpId == updatedPump.id) {
            dropletInjection.injectionPumpId = updatedPump.id;
            dropletInjection.injectionPumpName = updatedPump.pumpValue;
            $row.find('.injectionPumpName').text(updatedPump.pumpName);
        }
    });


    // TODO: remove after TS rework
    // @ts-ignore
    window.dropletInjections = dropletInjections;
}

// TODO: change type when defined for droplet
export function updateDroplet(updatedDroplet: any): void {
    let $tableRows = $('.injection-properties table tbody tr');
    $tableRows.each((index, row): void => {
        let $row = $(row);
        let dropletInjection: DropletInjection = $row.data('injection');

        if(dropletInjection.dropletId === updatedDroplet.id) {
            dropletInjection.dropletId = updatedDroplet.id;
            dropletInjection.dropletName = updatedDroplet.name;
            $row.find('.dropletName').text(updatedDroplet.name);
        }
    });


    // TODO: remove after TS rework
    // @ts-ignore
    window.dropletInjections = dropletInjections;
}

export function createNewInjection(newInjection: DropletInjection): void {
    if(newInjection.id >= nextId) {
        nextId = newInjection.id + 1;
    }

    dropletInjections.push(newInjection);

    let $tableBody = $('.injection-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td class="id"></td>').text(newInjection.id));
    $tableRow.append($('<td class="dropletName"></td>').text(newInjection.dropletName));
    $tableRow.append($('<td class="injectionTime"></td>').text(newInjection.injectionTime));
    $tableRow.append($('<td class="injectionPumpName"></td>').text(newInjection.injectionPumpName));
    $tableBody.append($tableRow);
    $tableRow.data('injection', newInjection);

    $tableRow.on('click', (): void => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $injectionProperties = $('.injection-properties');
        $injectionProperties.find('.copy-button').removeClass('disabled');
        $injectionProperties.find('.delete-button').removeClass('disabled');
        $injectionProperties.find('select[name="injectionPumpId"]').val(newInjection.injectionPumpId);
        $injectionProperties.find('select[name="dropletId"]').val(newInjection.dropletId);
        $injectionProperties.find('input[name="injectionTime"]').val(newInjection.injectionTime);
    });

    $tableRow.trigger('click');


    // TODO: remove after TS rework
    // @ts-ignore
    window.dropletInjections = dropletInjections;
}

function resetInjectionSelection(): void {
    let $injectionProperties = $('.injection-properties');
    $injectionProperties.find('.table-wrapper').find('.active').removeClass('active');

    $injectionProperties.find('.copy-button').addClass('disabled');
    $injectionProperties.find('.delete-button').addClass('disabled');

    $injectionProperties.find('select[name="injectionPumpId"]').val('');
    $injectionProperties.find('select[name="dropletId"]').val('');
    $injectionProperties.find('input[name="injectionTime"]').val('');
}

jQuery((): void => {
    $('#newDropletInjectionModal')
        .on('shown.bs.modal', (): void => {
            $(this).find('[autofocus]').trigger('focus');
        })
        .on('submit', (event: SubmitEvent): void => {
            event.preventDefault();

            let newDroplet = $('#newDropletInjectionModal #newDropletSelection');
            let newInjectionTime = $('#newDropletInjectionModal #newDropletInjectionTime');
            let newInjectionPump = $('#newDropletInjectionModal #newPumpSelection');

            let newInjection = new DropletInjection(
                nextId++,
                Number(newDroplet.val()),
                Number(newInjectionPump.val()),
                newDroplet.find('option:selected').text(),
                newInjectionPump.find('option:selected').text(),
                Number(newInjectionTime.val())
            );

            createNewInjection(newInjection);

            // Clean up modal
            $('#newDropletInjectionModal').modal('hide');

            newDroplet.val('');
            newInjectionTime.val('');
            newInjectionPump.val('');
        });

    $('.injection-properties .copy-button').on('click', (element): void => {
        if(!$(element.currentTarget).is('.disabled')) {
            let $activeRow = $('.injection-properties .table-wrapper tr.active');
            let injectionToCopy: DropletInjection = $activeRow.data('injection');
            let newInjection = Object.assign({}, injectionToCopy);

            newInjection.id = nextId++;

            createNewInjection(newInjection);
        }
    });

    $('.injection-properties .delete-button').on('click', (): void => {
        let $activeRow = $('.injection-properties .table-wrapper tr.active');
        let injectionToDelete: DropletInjection = $activeRow.data('injection');
        dropletInjections.splice(dropletInjections.indexOf(injectionToDelete), 1);
        resetInjectionSelection();
        $activeRow.remove();


        // TODO: remove after TS rework
        // @ts-ignore
        window.dropletInjections = dropletInjections;
    });

    $('.injection-properties input').on('input', (event): void => {
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

    $('.injection-properties select').on('change', (event): void => {
        let $activeRow = $('.injection-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeInjection = $activeRow.data('injection');
        let $select = $(event.target);
        let inputName = $select.attr('name');

        if(inputName === 'injectionPumpId') {
            activeInjection.injectionPumpId = $select.val();
            activeInjection.injectionPumpName = $select.find('option:selected').text();
            $activeRow.find('.injectionPumpName').text(activeInjection.injectionPumpName);
        }

        if(inputName === 'dropletId') {
            activeInjection.dropletId = $select.val();
            activeInjection.dropletName = $select.find('option:selected').text();
            $activeRow.find('.dropletName').text(activeInjection.dropletName);
        }
    });
});


export {
    dropletInjections
}

// TODO: remove after TS rework
// @ts-ignore
window.dropletInjections = dropletInjections;
// @ts-ignore
window.createNewInjection = createNewInjection;
// @ts-ignore
window.updatePump = updatePump;
