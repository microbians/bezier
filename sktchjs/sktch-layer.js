/********************************************************
	CANVAS.js – microbians.com
	Layer structure that holds objects and the canvas itself as extends Canvas (not he context)
********************************************************/

class Layer extends Canvas {
	constructor(layerOptions) {
		//x, y, w, h, RETINA, FAKEAA = 0, grid = false, debug=false) {

		layerOptions.id = layerOptions.id || `layer[${Layer.UID}]`;
		super(layerOptions);
		// To rewrite the original Canvas functions this must be call before anything and after super()
		this.CanvasAppendTo=Canvas.prototype.appendTo; // Call the function form Path.render

		this.type = 'Layer';
		this.UID = Layer.UID;

		this.elements = new Set();														// For add objects

		this.offCanvas = {};
		this.mskCanvas = {};

		if (!layerOptions.grid) {														// Only create a grid if not grid is given
			if (!layerOptions.gridSize) {
				layerOptions.gridSize=20;
			}
			this.grid = new Grid(this.w, this.h, layerOptions.gridSize);          		// The defult grid divides space by 10
		} else {
			this.grid = layerOptions.grid;
		}

		this.parent = {};														// Will set the parent that must be a Stage

		this.debug = layerOptions.debug;

		if (this.debug==true) {
			this.debug = new Canvas({
				id: `debug[${Layer.UID}]`,
				x:this.x,
				y:this.y,
				h:this.h,
				w:this.w,
				RETINA:this.RETINA,
				FAKEAA:this.FAKEAA
			});
			this.debug.domElm.style.opacity=.2;
			this.debug.domElm.style.zIndex = 1;
			this.debug.parent = this;
		}

		if (!layerOptions.mskCanvas) {
			// Crea el buffer para máscaras
			layerOptions.id = `mskCanvas[${Layer.UID}]`;						// Same ID
			this.mskCanvas = new Canvas(layerOptions);
			this.mskCanvas.UID = Layer.UID;
		} else {
			this.mskCanvas = layerOptions.mskCanvas;
		}

		if (!layerOptions.offCanvas) {
			// Crea el buffer para máscaras
			layerOptions.id = `offCanvas[${Layer.UID}]`;						// Same ID
			this.offCanvas = new Canvas(layerOptions);
			this.offCanvas.UID = Layer.UID;
		} else {
			this.offCanvas = layerOptions.offCanvas;
		}


		Layer.UID++;
	}

	addOffCanvas() {
	}

	appendTo(domElm) {
		if (this.debug.parent==this) {											// Debug is linked to this Layer not comes fronm Stage
			this.containerElm = document.createElement('div');
			this.containerElm.id = `layerContainer[${this.UID}]`;
			this.debug.appendTo(this.containerElm)
			this.CanvasAppendTo(this.containerElm);

			domElm = domElm || document.body; 											// appendTo is an html element or undefined -> body
			if (typeof domElm == "string") { 											// creating inside an existing DIV
				domElm = document.getElementById(domElm);
			}
			domElm.appendChild(this.containerElm);
		} else {
			this.CanvasAppendTo(domElm);
		}
	}

	append(el) {																// Append objects to the Layer
		el.parent = this;
		el.layer  = this;
		el.zIndex=this.elements.size-1;
		el.updateBoundingBox();
		this.grid.append(el);
		this.elements.add(el);
	}

	remove(el) {
		this.grid.remove(el);
		this.elements.delete(el);
	}

	updateBoundingBox(layer) {
		if (!layer) { var layer = this;	}

		let elms = new Set();
		for (let e of layer.elements) {
			layer.grid.update(e);
			e.dirty = false;
			if (e.boundingBox.max_x<0 ||
				e.boundingBox.max_y<0 ||
				e.boundingBox.min_x>layer.w ||
				e.boundingBox.min_y>layer.h ) {
					continue;
			}
			elms.add(e)
		}
		return elms
	}

	render(layer) {
		if (!layer) { layer = this;	}

		let elms = layer.updateBoundingBox(layer);

		let cells = layer.grid.cells.filter( c => ( c.dirty ==  true || c.oldDirty ==  true ) );		// Only the dirty ones
		if (cells.length<layer.grid.cells.length*.95) {
			elms=new Set();
			for (let i=0; i<cells.length; i++) {
				let c = cells[i].id;
				let x1 = layer.grid.getX(c);
				let y1 = layer.grid.getY(c);
	            for (let e of cells[i].elements) {
					elms.add(e);
				}

			}
		}

		elms = [...elms].sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);

		layer.canvas.save();

		if ( cells.length<layer.grid.cells.length*.95 ) {

			if (document.getElementById("debug")) {
				document.getElementById("debug").innerHTML = `Cells to render ${cells.length} of ${layer.grid.cells.length} -> ${elms.length} of ${layer.elements.size}`;
			}

            if (layer.debug) {
				layer.debug.canvas.globalCompositeOperation 	= "source-over"; 	//"source-over";
				layer.debug.clear()
				for (let j=0; j<layer.grid.cells.length; j++) {
					layer.debug.canvas.strokeStyle = "rgba(0,0,0,.2)"
					layer.debug.canvas.lineWidth=1;
					layer.debug.canvas.strokeRect( layer.grid.getX(j), layer.grid.getY(j), layer.grid.cellW, layer.grid.cellH );
				}
			}

			layer.mskCanvas.canvas.globalCompositeOperation = "source-over"; 	//"source-over";
			layer.mskCanvas.clear();
			layer.offCanvas.clear();

			for (let i=0; i<cells.length; i++) {
				let c = cells[i].id;
				let x1 = layer.grid.getX(c);
				let y1 = layer.grid.getY(c);
				layer.mskCanvas.canvas.fillRect( x1, y1, layer.grid.cellW, layer.grid.cellH );
				if (layer.debug) {
					layer.debug.canvas.fillStyle = "#00A0A0";
					layer.debug.canvas.fillRect( x1, y1, layer.grid.cellW, layer.grid.cellH );
				}
			}

            layer.offCanvas.canvas.globalCompositeOperation = "source-over"; 	//"source-over";
            for(let e of elms) {
				e.render(layer.offCanvas, 1);
			}

			layer.canvas.globalCompositeOperation = "destination-out"; //"source-over";
			layer.copy(layer.mskCanvas)

			layer.offCanvas.canvas.globalCompositeOperation = "destination-in"; //"source-over";
			layer.offCanvas.copy(layer.mskCanvas)

			layer.canvas.globalCompositeOperation = "source-over";
			layer.copy(layer.offCanvas)

		} else {
			if (layer.debug) {
				layer.debug.canvas.globalCompositeOperation = "source-over"; 	//"source-over";
				layer.debug.clear()
				for (let j=0; j<layer.grid.cells.length; j++) {
					layer.debug.canvas.strokeStyle = "black"
					layer.debug.canvas.lineWidth=1;
					layer.debug.canvas.strokeRect( layer.grid.getX(j), layer.grid.getY(j), layer.grid.cellW, layer.grid.cellH );
				}
				for (let i=0; i<cells.length; i++) {
					let c = cells[i].id;
					let x1 = layer.grid.getX(c);
					let y1 = layer.grid.getY(c);
					layer.debug.canvas.fillStyle = "#00A0A0";
					layer.debug.canvas.fillRect( x1, y1, layer.grid.cellW, layer.grid.cellH );
				}
			}

			layer.clear();

			for(let e of elms) {
                e.render(layer, 1);
			}

			if (document.getElementById("debug")) {
				document.getElementById("debug").innerHTML = `<b>FULL RENDER</b> -> ${elms.length} of ${layer.elements.size}`;
			}
		}

		layer.canvas.restore();
		layer.grid.cleanDirty();													// Clean dirty cells plus oldones from prior render
	}
}
Layer.UID = 0; 																	// unique ID
