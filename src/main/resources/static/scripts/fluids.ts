import * as $ from "jquery";
import {Fluid} from "./classes/Fluid";
import {phaseProperties} from "./phases";
import {formatNumber} from "./number-formatter";
import messageTranslations from "./messageTranslation";
import SubmitEvent = JQuery.SubmitEvent;

let fluids: Fluid[] = [];
let nextId = 0;

export function createNewFluid(newFluid: Fluid): void {
    if(newFluid.id >= nextId) {
        nextId = newFluid.id + 1;
    }

    fluids.push(newFluid);

    let $tableBody = $('.fluid-properties table tbody');
    let $tableRow = $('<tr class="active"></tr>');
    $tableRow.append($('<td class="id"></td>').text(newFluid.id));
    $tableRow.append($('<td class="name"></td>').text(newFluid.name));
    $tableRow.append($('<td class="mu"></td>').text(formatNumber(newFluid.mu)));
    $tableRow.append($('<td class="densityC"></td>').text(formatNumber(newFluid.densityC)));
    $tableBody.append($tableRow);
    $tableRow.data('fluid', newFluid);

    $tableRow.on('click', (): void => {
        $tableBody.find('.active').removeClass('active');
        $tableRow.addClass('active');

        let $fluidPropertiesWindow = $('.fluid-properties');
        $fluidPropertiesWindow.find('.copy-button').removeClass('disabled');
        $fluidPropertiesWindow.find('.delete-button').removeClass('disabled');
        $fluidPropertiesWindow.find('input[name="mu"]').val(newFluid.mu);
        $fluidPropertiesWindow.find('input[name="densityC"]').val(newFluid.densityC);
    });

    $tableRow.trigger('click');
    $('.fluid-properties .copy-button').removeClass('disabled');
    $('.fluid-properties .delete-button').removeClass('disabled');


    $('#contPhaseFluid').append($('<option>').attr('value', newFluid.id).text(newFluid.name));
    $('#disptPhaseFluid').append($('<option>').attr('value', newFluid.id).text(newFluid.name));
}

export function deleteFluid(fluidToDelete: Fluid): void {
    let $activeRow = $('.fluid-properties .table-wrapper tbody tr').filter((index, element): boolean => {
        return ($(element).data('fluid') as Fluid).id === fluidToDelete.id;
    });

    fluids.splice(fluids.indexOf(fluidToDelete), 1);
    $activeRow.remove();

    $('#contPhaseFluid option[value=\"' + fluidToDelete.id + '\"]').remove();
    $('#disptPhaseFluid option[value=\"' + fluidToDelete.id + '\"]').remove();

    if(phaseProperties.contPhaseFluid === fluidToDelete.id) {
        phaseProperties.contPhaseFluid = null;
    }

    if(phaseProperties.disptPhaseFluid === fluidToDelete.id) {
        phaseProperties.disptPhaseFluid = null;
    }
}

function resetFluidSelection(): void {
    let $fluidProperties = $('.fluid-properties');
    $fluidProperties.find('.table-wrapper').find('.active').removeClass('active');

    $fluidProperties.find('.copy-button').addClass('disabled');
    $fluidProperties.find('.delete-button').addClass('disabled');

    $fluidProperties.find('input[name="mu"]').val('');
    $fluidProperties.find('input[name="densityC"]').val('');
}

jQuery((): void => {

    $('#newFluidModal').on('submit', (event: SubmitEvent): void => {
        event.preventDefault();

        let newFluidName = $('#newFluidForm #newFluidName');
        let newMu = $('#newFluidForm input[name="newMu"]');
        let newDensityC = $('#newFluidForm input[name="newDensityC"]');

        let name = (newFluidName.val() as string).toLowerCase().trim();
        if(fluids.find(value => value.name.toLowerCase() == name)) {
            $('#newFluidModal form').prepend($('<span class="validation text-danger mb-2">').text(messageTranslations.duplicateFluid));
            return;
        }

        let newFluid = new Fluid(
            nextId++,
            newFluidName.val().toString(),
            Number(newMu.val()),
            Number(newDensityC.val())
        );

        createNewFluid(newFluid);

        $('#newFluidModal').modal('hide');
    });

    $('.fluid-properties .copy-button').on('click', (element): void => {
        if(!$(element.currentTarget).is('.disabled')) {
            $('#copyFluidModal').modal('show')
        }
    });

    $('.fluid-properties .delete-button').on('click', (): void => {
        let $activeRow = $('.fluid-properties .table-wrapper tr.active');
        let fluidToDelete: Fluid = $activeRow.data('fluid');
        resetFluidSelection();
        deleteFluid(fluidToDelete);
    });

    $('#copyFluidModalForm').on('submit', (event): void => {
        event.preventDefault();

        let $activeRow = $('.fluid-properties .table-wrapper tr.active');
        let fluidToCopy: Fluid = $activeRow.data('fluid');
        let newFluid = Object.assign({}, fluidToCopy);
        let $nameInput = $('#newFluidFromCopyName');

        newFluid.id = nextId++;
        newFluid.name = $nameInput.val().toString();

        createNewFluid(newFluid);

        $('#copyFluidModal').modal('hide');
    });

    $('.fluid-properties input').on('input', (event): void => {
        let $activeRow = $('.fluid-properties table tbody .active');
        if($activeRow.length === 0) return;

        let activeFluid: Fluid = $activeRow.data('fluid');
        let $inputField = $(event.target);
        let inputName = $inputField.attr('name');

        if(inputName === "densityC") {
            activeFluid.densityC = Number($inputField.val());
            $activeRow.find('.densityC').text(activeFluid.densityC);
        }
        if(inputName === "mu") {
            activeFluid.mu = Number($inputField.val());
            $activeRow.find('.mu').text(activeFluid.mu);
        }
        if(inputName === "name") {
            activeFluid.name = $inputField.val().toString();
            $activeRow.find('.name').text(activeFluid.name);
        }
    });
});

export {
    fluids
}
