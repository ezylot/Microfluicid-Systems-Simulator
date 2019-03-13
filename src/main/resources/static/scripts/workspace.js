(function() {
    const canvas = new fabric.Canvas('c', { selection: false });
    const grid = 10;
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    let canvasContainer = $('.workspace');
    canvas.setHeight(canvasContainer.height())
    canvas.setWidth(canvasContainer.width())
    window.onresize = () => {
        canvas.setHeight(canvasContainer.height())
        canvas.setWidth(canvasContainer.width())
    };

    for (let i = 0; i < (canvas.width / grid); i++) {
        canvas.add(new fabric.Line([ i * grid, 0, i * grid, canvas.height], { stroke: '#ccc', selectable: false }));
    }
    for (let i = 0; i < (canvas.height / grid); i++) {
        canvas.add(new fabric.Line([ 0, i * grid, canvas.width, i * grid], { stroke: '#ccc', selectable: false }))
    }

    canvas.on('mouse:down', function(opt) {
        if (opt.e.altKey === true) {
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
        }
    });

    canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
            this.viewportTransform[4] += opt.e.clientX - this.lastPosX;
            this.viewportTransform[5] += opt.e.clientY - this.lastPosY;
            this.requestRenderAll();
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
        }
    });

    canvas.on('mouse:up', function(opt) {
        this.isDragging = false;
        this.selection = true;
        canvas.getObjects().forEach(value => {
            value.setCoords();
        })
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
            left: coords[0],
            top: coords[1],
            strokeWidth: 5,
            radius: 7,
            fill: '#fff',
            stroke: '#666'
        });
        circleStart.pos = 'start';
        circleStart.lines = [{line: line, pos: circleStart.pos}];
        circleStart.hasControls = circleStart.hasBorders = false;

        let circleEnd = new fabric.Circle({
            left: coords[2],
            top: coords[3],
            strokeWidth: 5,
            radius: 7,
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
                    circles[value.left][value.top].lines.push(value.lines[0]);
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
            left: left,
            top: top
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
})();