/********************************************************
	CANVAS.js – microbians.com
	Create sets of layers with Stage
********************************************************/
 
class Stage{
	constructor(stageOptions) {

		this.x = stageOptions.x;
		this.y = stageOptions.y;
		this.w = stageOptions.w;
		this.h = stageOptions.h;

		this.boundingBox = new BoundingBox({min_x:0,min_y:0,max_x:this.w-1,max_y:this.h-1});

		this.RETINA = stageOptions.RETINA;
		this.FAKEAA = stageOptions.FAKEAA;
		this.maxElementsByLayer = stageOptions.maxElementsByLayer || Infinity;

		this.domElm = document.createElement('div');

		this.domElm.UID= Stage.UID;
		this.domElm.id = `stage[${Stage.UID}]`;

		this.layers=[];

		if (!stageOptions.grid) {														// Only create a grid if not grid is given
			if (!stageOptions.gridSize) {
				stageOptions.gridSize=20;
			}
			this.grid = new Grid(this.w, this.h, stageOptions.gridSize);          		// The defult grid divides space by 10
		} else {
			this.grid = stageOptions.grid;
		}

		this.debug = stageOptions.debug;

		if (this.debug==true) {
			this.debug = new Canvas({
				id: `debug[${Stage.UID}]`,
				x:this.x,
				y:this.y,
				h:this.h,
				w:this.w,
				RETINA:this.RETINA,
				FAKEAA:this.FAKEAA
			});
			this.debug.appendTo(this.domElm);

			this.debug.domElm.style.opacity=.2;
			this.debug.domElm.style.zIndex=1;

			this.debug.parent = this;
			this.debug.stage = this;
		}

		this.addLayer();

		Stage.UID++;
	}

	addLayer() {
		this.layers.push( new Layer({
			x:			this.x,
			y:			this.y,
			h:			this.h,
			w:			this.w,
			RETINA:		this.RETINA,
			FAKEAA:		this.FAKEAA,
			grid:		this.grid,
			debug:		this.debug
		}));
		this.layers.last().parent = this;
		this.layers.last().stage  = this;
		this.layers.last().appendTo(this.domElm);
	}

	appendTo(elm) {
		elm = elm || document.body; 											// appendTo is an html element or undefined -> body
		if (typeof elm == "string") { 											// creating inside an existing DIV
			elm = document.getElementById(elm);
		}
		elm.appendChild(this.domElm);
	}

	append(elm) {
		if (this.layers.length==0 || this.layers.last().elements.length>this.maxElementsByLayer) {
			this.addLayer();
		}
		this.layers.last().append(elm);
	}
	render(el) {

		if (this.debug) {
			document.getElementById("debug").innerHTML = "";
			this.debug.clear();
		}
		let maxElements = 0
		for(var i=0; i<this.layers.length; i++) {
			maxElements+=this.layers[i].elements.length;
			this.layers[i].render(el);
		}

		if (this.debug) {
			document.getElementById("debug").innerHTML += `${maxElements} objects in scene`;
		}

		Stage.cicles++;
	}
}
Stage.UID=0;																	// unique ID
Stage.cicles=0;
