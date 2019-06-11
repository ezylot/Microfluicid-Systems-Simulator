import * as $ from "jquery";
import ClickEvent = JQuery.ClickEvent;
import {createNewFluid, fluids} from "./fluids";
import {createNewDroplet, droplets} from "./droplets";
import {createNewInjection, dropletInjections} from "./dropletInjections";
import {phaseProperties, setPhaseProperties} from "./phases";
import {defaultValues, setDefaultValues} from "./defaultvalue";
import {SaveStructure} from "./classes/SaveStructure";
import {Canvas, Group, Line} from "fabric/fabric-impl";
import {Fluid} from "./classes/Fluid";
import {Channel} from "./classes/Channel";
import {Pump} from "./classes/Pump";
import {Droplet} from "./classes/Droplet";
import {DropletInjection} from "./classes/DropletInjection";
import {resetValues} from "./value-reset";


export function getSaveAsJson(): string {

    // TODO: remove after rework
    // @ts-ignore
    let canvasToSave: Canvas = window.canvasToSave;
    // TODO: remove after rework
    // @ts-ignore
    let pumpsInternal: Pump[] = pumps;


    let saveStructure: SaveStructure = {
        fluids: fluids,
        pumps: pumpsInternal,
        droplets: droplets,
        dropletInjections: dropletInjections,
        phaseProperties: phaseProperties,
        defaultValues: defaultValues,
        canvas: {
            lines: canvasToSave.getObjects("line")
                .map((line: Line | any): Channel => {
                    return new Channel(
                        line.channelType,
                        line.x1,
                        line.x2,
                        line.y1,
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
        document.getElementById('fileupload').addEventListener('change', (evt: any): void => {

            // TODO: remove after rework
            // @ts-ignore
            let canvasToSave: Canvas = window.canvasToSave;

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
                    // TODO: remove after converting
                    // @ts-ignore
                    makeChannel(canvasToSave, [channel.x1, channel.y1, channel.x2, channel.y2], ChannelTypes[channel.channelType], channel.properties);
                });

                // TODO: remove after converting
                // @ts-ignore
                mergeElements(canvasToSave);

                object.pumps.forEach((pump: Pump): void => {
                    canvasToSave.getObjects("group")
                        .filter((circleGroup: Group | any): boolean => circleGroup.represents === 'endCircle')
                        .filter((circleGroup: Group | any): boolean => circleGroup.top === pump.top && circleGroup.left === pump.left)
                        .forEach((circleGroup: Group | any): void => {
                            // TODO: remove after converting
                            // @ts-ignore
                            createPump(pump, pumps);
                            // @ts-ignore
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
        }, false);
        document.getElementById('fileupload').click();
    });
});

