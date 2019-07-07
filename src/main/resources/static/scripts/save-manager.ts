import * as $ from "jquery";
import ClickEvent = JQuery.ClickEvent;
import {createNewFluid, fluids} from "./fluids";
import {createNewDroplet, droplets} from "./droplets";
import {createNewInjection, dropletInjections} from "./dropletInjections";
import {phaseProperties, setPhaseProperties} from "./phases";
import {defaultValues, setDefaultValues} from "./defaultvalue";
import {SaveStructure} from "./classes/SaveStructure";
import {Fluid} from "./classes/Fluid";
import {Channel} from "./classes/Channel";
import {Pump} from "./classes/Pump";
import {Droplet} from "./classes/Droplet";
import {DropletInjection} from "./classes/DropletInjection";
import {resetValues} from "./value-reset";
import {
    canvasToSave,
    createPump,
    createOrUpdatePumpElement,
    makeChannel,
    mergeElements,
    pumps,
    PumpTypes
} from "./workspace";
import {ChannelEndCircle} from "./fabricElements/ChannelEndCircle";
import {ChannelLine} from "./fabricElements/ChannelLine";
import ChangeEvent = JQuery.ChangeEvent;


export function getSaveAsJson(): string {
    let saveStructure: SaveStructure = {
        fluids: fluids,
        pumps: pumps,
        droplets: droplets,
        dropletInjections: dropletInjections,
        phaseProperties: phaseProperties,
        defaultValues: defaultValues,
        canvas: {
            lines: canvasToSave.getObjects("line")
                .filter((value): boolean => value instanceof ChannelLine)
                .map((line: ChannelLine): Channel => {
                    return new Channel(
                        line.channelType,
                        line.x1,
                        line.y1,
                        line.x2,
                        line.y2,
                        line.properties,
                    );
                })
        }
    };

    return JSON.stringify(saveStructure, null, 2);
}

jQuery((): void => {
    $('.fa-save').on('click', (event: ClickEvent): void => {
        let file =  new Blob([
            getSaveAsJson()
        ], {type : 'application/json'});
        event.target.href = URL.createObjectURL(file);
        event.target.download = 'microfluidic-' + Date.now() + '.save';
    });

    $('#fileupload').on('change', (evt: ChangeEvent): void => {
        let file = evt.target.files[0];
        let reader = new FileReader();
        reader.onload = (): void => {
            let object: SaveStructure = JSON.parse(reader.result.toString());

            resetValues();

            $(window).trigger('resize');

            setDefaultValues(object.defaultValues);

            object.fluids.forEach((fluid: Fluid): void => {
                createNewFluid(Fluid.cloneTyped(fluid));
            });

            object.canvas.lines.forEach((channel: Channel): void => {
                makeChannel(Channel.cloneTyped(channel));
            });

            mergeElements(canvasToSave);

            object.pumps.forEach((pump: Pump): void => {
                canvasToSave.getObjects("group")
                    .filter((circleGroup): boolean => circleGroup instanceof ChannelEndCircle)
                    .filter((circleGroup: ChannelEndCircle): boolean => circleGroup.top === pump.top && circleGroup.left === pump.left)
                    .forEach((circleGroup: ChannelEndCircle): void => {
                        let typedPump = Pump.cloneTyped(pump);
                        createPump(typedPump);
                        createOrUpdatePumpElement(circleGroup, PumpTypes[typedPump.type], typedPump);
                    });
            });

            setPhaseProperties(object.phaseProperties);

            object.droplets.forEach((droplet: Droplet): void => {
                createNewDroplet(Droplet.cloneTyped(droplet));
            });

            object.dropletInjections.forEach((injection: DropletInjection): void => {
                createNewInjection(DropletInjection.cloneTyped(injection));
            });
        };
        reader.readAsText(file);
        $('#fileupload').val(null);
    });

    $('.fa-folder-open').on('click', (): void => {
        $('#fileupload').trigger('click');
    });

    $('.fa-file-alt').on('click', (): void => {
        location.reload();
    });
});

