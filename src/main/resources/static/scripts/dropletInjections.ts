import * as $ from "jquery";
import 'bootstrap';
import {DropletInjection} from "./classes/DropletInjection";
import {Pump} from "./classes/Pump";
import {Droplet} from "./classes/Droplet";
import SubmitEvent = JQuery.SubmitEvent;

let dropletInjections: DropletInjection[] = [];
let nextId = 0;

export function updatePump(updatedPump: Pump): void {
    let $tableRows = $('.injection-properties table tbody tr');
    $tableRows.each((index, row): void => {
        let $row = $(row);
        let dropletInjection: DropletInjection = $row.data('injection');

        if (dropletInjection.injectionPumpId == updatedPump.id) {
            dropletInjection.injectionPumpId = updatedPump.id;
            dropletInjection.injectionPumpName = updatedPump.pumpName;
            $row.find('.injectionPumpName').text(updatedPump.pumpName);
        }
    });

    $(`#newPumpSelection option[value=${updatedPump.id}]`).text(updatedPump.pumpName);
    $(`#pumpSelection option[value=${updatedPump.id}]`).text(updatedPump.pumpName);
}

export function updateDropletInInjection(updatedDroplet: Droplet): void {
    $(`#newDropletSelection option[value=${updatedDroplet.id}]`).text(updatedDroplet.name);
    $(`#dropletSelection option[value=${updatedDroplet.id}]`).text(updatedDroplet.name);

    let $tableRows = $('.injection-properties table tbody tr');
    $tableRows.each((index, row): void => {
        let $row = $(row);
        let dropletInjection: DropletInjection = $row.data('injection');

        if (dropletInjection.dropletId === updatedDroplet.id) {
            dropletInjection.dropletId = updatedDroplet.id;
            dropletInjection.dropletName = updatedDroplet.name;
            $row.find('.dropletName').text(updatedDroplet.name);
        }
    });
}

export function createDropletInInjection(newDroplet: Droplet): void {
    $('#newDropletSelection,#dropletSelection').append($('<option>')
        .text(newDroplet.name)
        .attr('value', newDroplet.id)
    );
}

export function deleteDropletFromInjection(dropletToDelete: Droplet): void {
    $(`#dropletSelection option[value=${dropletToDelete.id}]`).remove();
    $(`#newDropletSelection option[value=${dropletToDelete.id}]`).remove();

    let $tableRows = $('.injection-properties table tbody tr');
    $tableRows.each((index, row): void => {
        let $row = $(row);
        let dropletInjection: DropletInjection = $row.data('injection');

        if (dropletInjection.dropletId === dropletToDelete.id) {
            dropletInjection.dropletId = null;
            dropletInjection.dropletName = null;
            $row.find('.dropletName').text('');
        }
    });
    dropletInjections.forEach((value: DropletInjection): void => {
        if (value.dropletId === dropletToDelete.id) {
            value.dropletId = null;
        }
    });
}

export function createNewInjection(newInjection: DropletInjection): void {
    if (newInjection.id >= nextId) {
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
        $injectionProperties.find('select[name="dropletId"]').find('option:not([value])').remove();
        if(newInjection.dropletId == null) {
            $injectionProperties.find('select[name="dropletId"]').prepend($('<option>'))
        } else {
            $injectionProperties.find('select[name="dropletId"]').removeAttr('disabled').val(newInjection.dropletId);
        }
        $injectionProperties.find('.copy-button').removeClass('disabled');
        $injectionProperties.find('.delete-button').removeClass('disabled');
        $injectionProperties.find('select[name="injectionPumpId"]').removeAttr('disabled').val(newInjection.injectionPumpId);
        $injectionProperties.find('select[name="dropletId"]').removeAttr('disabled').val(newInjection.dropletId);
        $injectionProperties.find('input[name="injectionTime"]').removeAttr('disabled').val(newInjection.injectionTime);
    });

    $tableRow.trigger('click');
}

export function resetDropletInjections(): void {
    dropletInjections.splice(0, dropletInjections.length);
    $('.injection-properties .table-wrapper tbody tr').remove();
}

function deleteDropletInjection(injection: DropletInjection): void {
    let $activeRow = $('.injection-properties .table-wrapper tbody tr').filter((index, element): boolean => {
        return ($(element).data('injection') as DropletInjection).id === injection.id;
    });

    dropletInjections.splice(dropletInjections.indexOf(injection), 1);
    $activeRow.remove();
}

function resetInjectionSelection(): void {
    let $injectionProperties = $('.injection-properties');
    $injectionProperties.find('.table-wrapper').find('.active').removeClass('active');

    $injectionProperties.find('.copy-button').addClass('disabled');
    $injectionProperties.find('.delete-button').addClass('disabled');

    $injectionProperties.find('select[name="injectionPumpId"]').attr('disabled', 'disabled').val('');
    $injectionProperties.find('select[name="dropletId"]').attr('disabled', 'disabled').val('');
    $injectionProperties.find('input[name="injectionTime"]').attr('disabled', 'disabled').val('');
}

jQuery((): void => {
    resetInjectionSelection();

    $('#newDropletInjectionModal').on('submit', (event: SubmitEvent): void => {
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
        $('#newDropletInjectionModal').modal('hide');
    });

    $('.injection-properties .copy-button').on('click', (element): void => {
        if (!$(element.currentTarget).is('.disabled')) {
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
        resetInjectionSelection();
        deleteDropletInjection(injectionToDelete);
    });

    $('.injection-properties input').on('input', (event): void => {
        let $activeRow = $('.injection-properties table tbody .active');
        if ($activeRow.length === 0) return;

        let activeInjection: DropletInjection = $activeRow.data('injection');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        if (inputName === 'injectionTime') {
            activeInjection.injectionTime = Number($inputField.val());
            $activeRow.find('.injectionTime').text(activeInjection.injectionTime);
        }
    });

    $('.injection-properties select').on('change', (event): void => {
        $('.injection-properties')
            .find('select[name="dropletId"]')
            .find('option:not([value])')
            .remove();

        let $activeRow = $('.injection-properties table tbody .active');
        if ($activeRow.length === 0) return;

        let activeInjection = $activeRow.data('injection');
        let $select = $(event.target);
        let inputName = $select.attr('name');

        if (inputName === 'injectionPumpId') {
            activeInjection.injectionPumpId = Number($select.val());
            activeInjection.injectionPumpName = $select.find('option:selected').text();
            $activeRow.find('.injectionPumpName').text(activeInjection.injectionPumpName);
        }

        if (inputName === 'dropletId') {
            activeInjection.dropletId = Number($select.val());
            activeInjection.dropletName = $select.find('option:selected').text();
            $activeRow.find('.dropletName').text(activeInjection.dropletName);
        }
    });
});

export {
    dropletInjections
}

