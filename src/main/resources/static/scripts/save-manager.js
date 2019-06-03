$(document).ready(() => {
    $('.fa-save').click(function (event) {
        let file =  new Blob([
            JSON.stringify({
                fluids: fluids,
                pumps: pumps,
                droplets: droplets,
                dropletInjections: dropletInjections,
                canvas: {
                    lines: canvasToSave.getObjects("line")
                        .map(line => {
                            return {
                                channelType: line.channelType,
                                x1: line.x1,
                                x2: line.x2,
                                y1: line.y1,
                                y2: line.y2,
                                properties: line.properties
                            }
                        }),
                    pumps: canvasToSave.getObjects("group")
                        .filter(group => !!group.oldRepresents)
                        .map(group => {
                            return {
                                properties: group.properties,
                                oldRepresents: group.oldRepresents,
                                pumpType: group.pumpType,
                            }
                        })
                }
            }, null, 2)
        ], {type : 'application/json'});
        event.target.href = URL.createObjectURL(file);
        event.target.download = 'microfluidic-' + Date.now() + '.save';
    });

    $('.fa-folder-open').click(function () {
        function handleFileSelect(evt) {
            let file = evt.target.files[0];
            let reader = new FileReader();
            reader.onload = function(){
                let object = JSON.parse(reader.result);

                canvasToSave.clear();
                resetValues();
                $(window).trigger('resize');

                object.fluids.forEach(value => {
                    createNewFluid(value, fluids);
                });

                object.droplets.forEach(value => {
                    createNewDroplet(value, droplets);
                });

                object.dropletInjections.forEach(value => {
                    createNewInjection(value, dropletInjections);
                });

                object.canvas.lines.forEach(line => {
                    makeChannel(canvasToSave, [line.x1, line.y1, line.x2, line.y2], ChannelTypes[line.channelType], line.properties);
                });

                mergeElements(canvasToSave);

                object.pumps.forEach(pump => {
                    canvasToSave.getObjects("group")
                        .filter(circleGroup => circleGroup.represents === 'endCircle')
                        .filter(circleGroup => circleGroup.top === pump.top && circleGroup.left === pump.left)
                        .forEach(circleGroup => {
                            createPump(pump, pumps);
                            createPumpElement(circleGroup, PumpTypes[pump.type], pump);
                        });
                });

            };
            reader.readAsText(file);
        }

        document.getElementById('fileupload').addEventListener('change', handleFileSelect, false);
        document.getElementById('fileupload').click();
    });
});
