/********************************************************
	CANVAS.js – microbians.com
	Create canvas and all the s**t
********************************************************/
 
class Canvas {
	constructor(canvasOptions, contextOptions) {

		if (!contextOptions) {
			contextOptions = {alpha:true,desynchronized:true};
		}

		this.layer  = this;

		this.domElm = document.createElement('canvas');

		this.canvas = this.domElm.getContext("2d", contextOptions);

		this.canvas.imageSmoothingEnabled=true;
		this.canvas.imageSmoothingQuality='high';

		// canvas is de CTX, canvas.canvas is the DOM Element that holds de CTX context
		//this.domElm = this.canvas.canvas;

		if (canvasOptions.id) {
			this.domElm.id = canvasOptions.id;
		}

		// Default style
		this.domElm.style.display="block";
		this.domElm.style.position="absolute";
		this.domElm.style.isolation="isolate";
		this.domElm.style.userSelect="none"; 									// Prevent user selection when dragging
		this.domElm.style.margin="0";
		this.domElm.style.padding="0";

		this.RETINA = canvasOptions.RETINA || window.devicePixelRatio || 1;
		this.canvas.RETINA = this.RETINA

		// Size and position
		this.x = canvasOptions.x || 0;
		this.y = canvasOptions.y || 0;
		this.w = canvasOptions.w || 1024;
		this.h = canvasOptions.h || 1024;

		this.boundingBox = new BoundingBox({min_x:0, min_y:0, max_x:this.w-1, max_y:this.h-1});

		this.domElm.style.zoom=( 100 / this.RETINA )+"%";							// Made the canvas zoom inveser to the size scaled by the RETINA parameter

		this.FAKEAA = canvasOptions.FAKEAA || 0;
		if (this.domElm.FAKEAA > 0 ) {
			this.domElm.style.filter="blur("+ this.FAKEAA +"px)"; 					// Add a subttle bur as a Fake blur
		}

		this.canvas.scale(this.RETINA, this.RETINA);								// Set the scale of the contet as the RETINA

		// Hack drawImage canvas function for paste with the correct scale for RETINA

		this.canvas._drawImage = this.canvas.drawImage; // Backup function
		this.canvas.drawImage  = function(...args) {
			this.scale(1/this.RETINA,1/this.RETINA);
			this._drawImage(...args);
			this.scale(this.RETINA,this.RETINA);
		}

		this.canvas._moveTo = this.canvas.moveTo;
		this.canvas.moveTo = function(p,y) {
			typeof p == "object" ? this._moveTo(p.x,p.y) : this._moveTo(p,y);
		}

		this.canvas._lineTo = this.canvas.lineTo;
		this.canvas.lineTo = function(p,y) {
			typeof p == "object" ? this._lineTo(p.x,p.y) : this._lineTo(p,y);
		}

		this.canvas._quadraticCurveTo = this.canvas.quadraticCurveTo;
		this.canvas.quadraticCurveTo = function(pc,p2,px,py) {
			typeof pc == "object" ? this._quadraticCurveTo(pc.x,pc.y,p2.x,p2.y) : this._quadraticCurveTo(pc,p2,px,py);
		}
	}

	get x()  { return this._x; }
	set x(x) {
		if (x!=this._x) {
			this._x = x;
			this.domElm.style.left 	= x + "px";
		}
	}
	get y()  { return this._y; }
	set y(y) {
		if (y!=this._y) {
			this._y = y;
			this.domElm.style.top  	= y + "px";
		}
	}
	get w()  { return this._w; }
	set w(w) {
		if (w!=this._w) {
			this._w = w;
			this.domElm.style.width 	= (w * this.RETINA) + "px";
			this.domElm.width  		= (w * this.RETINA);
		}
	}
	get h()  { return this._h; }
	set h(h) {
		if (h!=this._h) {
			this._h=h;
			this.domElm.style.heighth 	= (h * this.RETINA) + "px";
			this.domElm.height  		= (h * this.RETINA);
		}
	}

	appendTo(domElm) {
		domElm = domElm || document.body; 											// appendTo is an html element or undefined -> body
		if (typeof domElm == "string") { 											// creating inside an existing DIV
			domElm = document.getElementById(domElm);
		}
		domElm.appendChild(this.domElm);
	}

	clear(box) {
		if (!box) {
			this.canvas.clearRect(0,0,this.w,this.h);
		} else {
			var x=box.min_x;
			var y=box.min_y;
			var w=box.max_x-box.min_x;
			var h=box.max_y-box.min_y;
			if (w>0 && h>0) this.canvas.clearRect(x,y,w,h);
		}
	}

	toPNG() {
		let png = new Image()
		png.src = this.domElm.toDataURL("image/png");
		return png;
	}

	copy(otherLayer) {
		this.canvas.drawImage(otherLayer.domElm, 0, 0);
		//let backupBuffer = otherLayer.canvas.getImageData(0, 0, this.w, this.h);
		//this.canvas.putImageData(backupBuffer, 0, 0);

	}

	resize(x,y,w,h){
		let backupBuffer = this.canvas.getImageData(0, 0, this.w, this.h);
		let newx = this.x-x;
		let newy = this.y-y;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.canvas.putImageData(backupBuffer, newx, newy);
		this.boundingBox = new BoundingBox({min_x:this.x,min_y:this.y,max_x:this.w-1,max_y:this.h-1});
	}

}
