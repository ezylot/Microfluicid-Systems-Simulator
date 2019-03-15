(function() {
    const canvas = new fabric.Canvas('c', { selection: false });
    const grid = 10;

    let canvasContainer = $('.workspace');
    let backgroundGroup = null;

    canvas.setHeight(canvasContainer.height());
    canvas.setWidth(canvasContainer.width());
    canvas.calcOffset();

    window.onresize = () => {
        canvas.setHeight(canvasContainer.height());
        canvas.setWidth(canvasContainer.width());
        canvas.calcOffset();
        redrawBackground();
    };

    function redrawBackground() {
        if(backgroundGroup) {
            canvas.remove(backgroundGroup);
        }

        let gridLines = [];
        const gridOverlap = 5;

        for (let i = -gridOverlap; i < (canvasContainer.width() / grid) + gridOverlap; i++) {
            let verticalGridLine = new fabric.Line([ i * grid, -gridOverlap * grid, i * grid, canvasContainer.height() + gridOverlap * grid], {
                stroke: '#eeeeee',
                selectable: false
            });
            gridLines.push(verticalGridLine);
        }
        for (let i = -gridOverlap; i < (canvasContainer.height() / grid) + gridOverlap; i++) {
            let horizontalGridLine = new fabric.Line([ -gridOverlap * grid, i * grid,  canvasContainer.width() + gridOverlap * grid, i * grid], {
                stroke: '#eeeeee',
                selectable: false
            });
            gridLines.push(horizontalGridLine);
        }

        backgroundGroup = new fabric.Group(gridLines, {
            selectable: false,
            evented: false,
        });
        canvas.add(backgroundGroup);
        backgroundGroup.sendToBack();

        let panHintText = new fabric.Text('Alt + Drag to move around', {
            left: canvasContainer.width() / 2 - 220,
            top: canvasContainer.height() - 100,
            fill: '#cccccc',
            opacity: 0.5,
            absolutePositioned: true
        });
        backgroundGroup.addWithUpdate(panHintText);
    }

    redrawBackground();

    canvas.on('mouse:down', opt => {
        if (opt.e.altKey === true) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        }
    });

    canvas.on('mouse:move', opt => {
        if (canvas.isDragging) {
            canvas.viewportTransform[4] += opt.e.clientX - canvas.lastPosX;
            canvas.viewportTransform[5] += opt.e.clientY - canvas.lastPosY;
            canvas.requestRenderAll();

            backgroundGroup.left -= opt.e.clientX - canvas.lastPosX;
            backgroundGroup.top -= opt.e.clientY - canvas.lastPosY;

            canvas.lastPosX = opt.e.clientX;
            canvas.lastPosY = opt.e.clientY;
        }
    });

    canvas.on('mouse:up', () => {
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.getObjects().forEach(value => {
            value.setCoords();
        });
        mergeCircles();
    });

    function makeLine(coords) {
        let line = new fabric.Line(coords, {
            fill: '#9c9c9c',
            stroke: '#9c9c9c',
            strokeWidth: 12,
            selectable: false,
            evented: false,
        });

        let circleStart = new fabric.Circle({
            left: coords[0] - grid/2,
            top: coords[1] - grid/2,
            strokeWidth: 5,
            radius: 10,
            fill: '#fff',
            stroke: '#666'
        });
        circleStart.pos = 'start';
        circleStart.lines = [{line: line, pos: circleStart.pos}];
        circleStart.hasControls = circleStart.hasBorders = false;

        let circleEnd = new fabric.Circle({
            left: coords[2] - grid/2,
            top: coords[3] - grid/2,
            strokeWidth: 5,
            radius: 10,
            fill: '#fff',
            stroke: '#666'
        });
        circleEnd.pos = 'end';
        circleEnd.lines = [{line: line, pos: circleEnd.pos}];
        circleEnd.hasControls = circleEnd.hasBorders = false;

        canvas.add(line);
        canvas.add(circleStart);
        canvas.add(circleEnd);
    }

    makeLine([ 100, 100, 200, 100 ]);
    makeLine([ 200, 100, 200, 50 ]);
    makeLine([ 200, 100, 200, 150 ]);
    makeLine([ 200, 150, 300, 150 ]);
    makeLine([ 200, 50, 300, 50 ]);
    makeLine([ 300, 50, 300, 100 ]);
    makeLine([ 300, 150, 300, 100 ]);
    makeLine([ 300, 100, 400, 100 ]);

    mergeCircles();
    
    function mergeCircles() {

        let circles = {};

        canvas.getObjects().forEach(value => {
            if(value.type === 'circle') {
                if(circles[value.left] && circles[value.left][value.top]) {
                    circles[value.left][value.top].lines = circles[value.left][value.top].lines.concat(value.lines);
                    canvas.remove(value);
                    circles[value.left][value.top].bringToFront();
                    return;
                }

                if(!circles[value.left]) {
                    circles[value.left] = {};
                }
                circles[value.left][value.top] = value;
            }
        })
    }
    
    canvas.on('object:moving', function(e) {
        let circle = e.target;

        let left = Math.round(circle.left / grid) * grid;
        let top = Math.round(circle.top / grid) * grid;

        circle.set({
            left: left - grid/2,
            top: top - grid/2
        });

        circle.lines.forEach(value => {
            if(value.pos === 'start') {
                value.line.set({ 'x1': left, 'y1': top });
            } else if(value.pos === 'end') {
                value.line.set({ 'x2': left, 'y2': top });
            } else {
                console.error("Circle to move did not match any end of the connected line");
            }
        });
        canvas.renderAll();
    });


    // TODO: selectable lines
    // TODO: show properties of selected liens
    // TODO: del to delete line
    // TODO: delete lines if start and end are same
})();