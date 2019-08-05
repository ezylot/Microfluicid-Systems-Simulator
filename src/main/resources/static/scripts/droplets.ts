import * as $ from "jquery";
import {Droplet} from "./classes/Droplet";
import {dropletInjections, updateDroplet} from "./dropletInjections";
import {DropletInjection} from "./classes/DropletInjection";
import "spectrum"
import {formatNumber} from "./number-formatter";
import SubmitEvent = JQuery.SubmitEvent;
import ClickEvent = JQuery.ClickEvent;
import messageTranslations from "./messageTranslation";

let nextId = 0;
let droplets: Droplet[] = [];


export function createNewDroplet(newDroplet: Droplet): void {
    if(newDroplet.id >= nextId) {
        nextId = newDroplet.id + 1;
    }

    droplets.push(newDroplet);

    let $tableBody = $('.droplet-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td class="id"></td>').text(newDroplet.id));
    $tableRow.append($('<td class="name"></td>').text(newDroplet.name));
    $tableRow.append($('<td class="volume"></td>').text(formatNumber(newDroplet.volume)));
    $tableBody.append($tableRow);
    $tableRow.data('droplet', newDroplet);

    $tableRow.on('click', (): void => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $dropletProperties = $('.droplet-properties');
        $dropletProperties.find('.copy-button').removeClass('disabled');
        $dropletProperties.find('.delete-button').removeClass('disabled');
        $dropletProperties.find('input[name="name"]').removeAttr('disabled').val(newDroplet.name);
        $dropletProperties.find('input[name="volume"]').removeAttr('disabled').val(newDroplet.volume);
        $dropletProperties.find('#dropletColor').removeAttr('disabled').spectrum({
            color: newDroplet.color,
            change: (color): void => { newDroplet.color = color.toString("hex"); }
        });
    });

    $tableRow.trigger('click');
    $('.droplet-properties .copy-button').removeClass('disabled');
    $('.droplet-properties .delete-button').removeClass('disabled');

    $('#newDropletSelection').append($('<option>')
        .text(newDroplet.name)
        .attr('value', newDroplet.id)
    );

    $('#dropletSelection').append($('<option>').attr('value', newDroplet.id)
        .text(newDroplet.name)
        .attr('value', newDroplet.id)
    );
}

export function deleteDroplet(dropletToDelete: Droplet): void {
    let $activeRow = $('.droplet-properties .table-wrapper tbody tr').filter((index, element): boolean => {
        return ($(element).data('droplet') as Droplet).id === dropletToDelete.id;
    });

    droplets.splice(droplets.indexOf(dropletToDelete), 1);
    $activeRow.remove();

    $('#newDropletSelection option[value=\"' + dropletToDelete.id + '\"]').remove();
    $('#dropletSelection option[value=\"' + dropletToDelete.id + '\"]').remove();

    dropletInjections.forEach((value: DropletInjection): void => {
        if(value.dropletId === dropletToDelete.id) {
            value.dropletId = null;
        }
    });
}

function resetDropletSelection(): void {
    let $dropletProperties = $('.droplet-properties');
    $dropletProperties.find('.table-wrapper').find('.active').removeClass('active');

    $dropletProperties.find('.copy-button').addClass('disabled');
    $dropletProperties.find('.delete-button').addClass('disabled');

    $dropletProperties.find('input[name="name"]').attr('disabled', 'disabled').val('');
    $dropletProperties.find('input[name="volume"]').attr('disabled', 'disabled').val('');
    $dropletProperties.find('#dropletColor').attr('disabled', 'disabled').spectrum({ color: '#ffffff' });
}

jQuery((): void => {
    resetDropletSelection();
    $('#newDropletModal').on('submit', (event: SubmitEvent): void => {
        event.preventDefault();

        let newDropletName = $('#newDropletModal #newDropletName');
        let newDropletVolume = $('#newDropletModal #newDropletVolume');
        let newDropletColor = $('#newDropletModal #newDropletColor');
        let newDroplet = new Droplet(nextId++, newDropletName.val().toString(), Number(newDropletVolume.val()), newDropletColor.spectrum("get").toString("hex"));

        let name = (newDropletName.val() as string).toLowerCase().trim();
        if(droplets.find(value => value.name.toLowerCase() == name)) {
            $('#newDropletModal form').prepend($('<span class="validation text-danger mb-2">').text(messageTranslations.duplicateFluid));
            return;
        }

        createNewDroplet(newDroplet);

        $('#newDropletModal').modal('hide');
        newDropletColor.spectrum({ color: '#ffffff' })
    });

    $('.droplet-properties .copy-button').on('click', (element: ClickEvent): void => {
        if(!$(element.currentTarget).is('.disabled')) {
            $('#copyDropletModal').modal('show')
        }
    });

    $('.droplet-properties .delete-button').on('click', (): void => {
        let $activeRow = $('.droplet-properties .table-wrapper tr.active');
        let dropletToDelete: Droplet = $activeRow.data('droplet');
        resetDropletSelection();
        deleteDroplet(dropletToDelete);
    });

    $('#copyDropletModalForm').on('submit', (event: SubmitEvent): void => {
        event.preventDefault();

        let $activeRow = $('.droplet-properties .table-wrapper tr.active');
        let dropletToCopy: Droplet = $activeRow.data('droplet');
        let newDroplet = Object.assign({}, dropletToCopy);
        let $nameInput = $('#newDropletFromCopyName');

        newDroplet.id = nextId++;
        newDroplet.name = $nameInput.val().toString();

        createNewDroplet(newDroplet);

        $('#copyDropletModal').modal('hide');
    });

    $('.droplet-properties input').on('input', (event): void => {
        let $activeRow = $('.droplet-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeDroplet: Droplet = $activeRow.data('droplet');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        if(inputName === 'volume') {
            activeDroplet.volume = Number($inputField.val());
            $activeRow.find('.volume').text(formatNumber(activeDroplet.volume));
        }

        if(inputName === 'name') {
            activeDroplet.name = $inputField.val().toString();
            $activeRow.find('.name').text(activeDroplet.name);
            $(`#newDropletSelection option[value=${activeDroplet.id}]`).text(activeDroplet.name);
            $(`#dropletSelection option[value=${activeDroplet.id}]`).text(activeDroplet.name);
        }

        updateDroplet(activeDroplet);
    });
});

export {
    droplets
}
