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
    createPumpElement,
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

    $('.fa-folder-open').on('click', (): void => {
        $('#fileupload').on('change', (evt: ChangeEvent): void => {

            let file = evt.target.files[0];
            let reader = new FileReader();
            reader.onload = (): void => {
                let object: SaveStructure = JSON.parse(reader.result.toString());

                canvasToSave.clear();

                resetValues();

                $(window).trigger('resize');

                setDefaultValues(object.defaultValues);

                object.fluids.forEach((value: Fluid): void => {
                    createNewFluid(value);
                });

                object.canvas.lines.forEach((channel: Channel): void => {
                    makeChannel(new Channel(channel.channelType, channel.x1, channel.y1, channel.x2, channel.y2, channel.properties));
                });

                mergeElements(canvasToSave);

                object.pumps.forEach((pump: Pump): void => {
                    canvasToSave.getObjects("group")
                        .filter((circleGroup): boolean => circleGroup instanceof ChannelEndCircle)
                        .filter((circleGroup: ChannelEndCircle): boolean => circleGroup.top === pump.top && circleGroup.left === pump.left)
                        .forEach((circleGroup: ChannelEndCircle): void => {
                            createPump(pump);
                            createPumpElement(circleGroup, PumpTypes[pump.type], pump);
                        });
                });

                setPhaseProperties(object.phaseProperties);

                object.droplets.forEach((value: Droplet): void => {
                    createNewDroplet(value);
                });

                object.dropletInjections.forEach((value: DropletInjection): void => {
                    createNewInjection(value);
                });
            };
            reader.readAsText(file);
        });
        document.getElementById('fileupload').click();
    });
});

