/********************************************************
	CANVAS.js – microbians.com
	Create canvas and all the s**t

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

class Canvas {
	constructor(canvasOptions, contextOptions) {

		if (!contextOptions) {
			contextOptions = {alpha:true,desynchronized:true};
		}

		this.layer  = this;

		this.domElm = document.createElement('canvas');

		contextOptions.willReadFrequently = false;
		this.canvas = this.domElm.getContext("2d", contextOptions);
		this.canvas.imageSmoothingEnabled	= true;
		this.canvas.imageSmoothingQuality	= 'high';

		this.RETINA = canvasOptions.RETINA || window.devicePixelRatio || 1;
		this.canvas.RETINA = this.RETINA;

		// Default style
		this.domElm.style.display="block";
		this.domElm.style.position="absolute";
		this.domElm.style.isolation="isolate";
		this.domElm.style.userSelect="none"; 									// Prevent user selection when dragging
		this.domElm.style.margin="0";
		this.domElm.style.padding="0";

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

		if (canvasOptions.id) {
			this.domElm.id = canvasOptions.id;
		}

		// Copy all the canvas function an properties (get/set) to the layer
		for (let key in this.canvas) {
			if (typeof this.canvas[key] === 'function') {
				this[key]=function(...args){
					this.canvas[key](...args);
				}
			} else if (key!=='canvas') {
				Object.defineProperty(this, key, {
					get: function(){ return this.canvas[key];} ,
  					set: function(v){ this.canvas[key]=v; },
				});
			}
		}

		this.stateQuaue=[];

		// Set the scale of the contet as the RETINA
		this.scale(this.RETINA, this.RETINA);

/*
		this.drawImage  = function(...args) {
			this.canvas.scale(1/this.RETINA,1/this.RETINA);
			this.canvas.drawImage(...args);
			this.canvas.scale(this.RETINA,this.RETINA);
		}
*/
		// Hack drawImage canvas function for paste with the correct scale for RETINA
		this.drawImage  = function(i,x,y,w,h) {
			this.canvas.drawImage(i, x, y, w && w/2 || i.width/this.RETINA, h && h/2 || i.height/this.RETINA);
		}

		// Alter the functions for handle vectors

		this.moveTo=function(p,y) {
			typeof p == "object" ? this.canvas.moveTo(p.x,p.y) : this.canvas.moveTo(p,y);
		}

		this.lineTo=function(p,y) {
			typeof p == "object" ? this.canvas.lineTo(p.x,p.y) : this.canvas.lineTo(p,y);
		}

		this.quadraticCurveTo=function(pc,p2,px,py) {
			typeof pc == "object" ? this.canvas.quadraticCurveTo(pc.x,pc.y,p2.x,p2.y) : this.canvas.quadraticCurveTo(pc,p2,px,py);
		}

		this.arc=function(p,y,r,as,af) {
			typeof p == "object" ? this.canvas.arc(p.x,p.y,y,r,as) : this.canvas.arc(p,y,r,as,af);
		}

		this.arcTo=function(p1,p2,x,y,r) {
			typeof p == "object" ? this.canvas.arcTo(p1.x,p1.y,p2.x,p2.y,x) : this.canvas.arcTo(p1,p2,x,y,r);
		}

		this.circle=function(p,r) {
			this.canvas.arc(p.x,p.y,r,0, Math.PIDouble);
		}

		//public function lineStyle(thickness:Number = NaN, color:uint = 0, alpha:Number = 1.0, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = null, joints:String =
		this.lineStyle=function(thickness, color, alpha) {
			this.canvas.lineWidth   = thickness || undefined;
			this.canvas.strokeStyle = color || undefined;
			this.canvas.globalAlpha = alpha || 1;
		}

		this.save = function(){
			let qeue = this.stateQuaue;
			qeue.push({
				globalAlpha:					this.canvas.globalAlpha,
				globalCompositeOperation:		this.canvas.globalCompositeOperation,
				strokeStyle:					this.canvas.strokeStyle,
				fillStyle:						this.canvas.fillStyle,
				lineWidth:						this.canvas.lineWidth,
				lineCap:						this.canvas.lineCap,
				lineJoin:						this.canvas.lineJoin,
				miterLimit:						this.canvas.miterLimit,
				lineDashOffset:					this.canvas.lineDashOffset,
				shadowOffsetX:					this.canvas.shadowOffsetX,
				shadowOffsetY:					this.canvas.shadowOffsetY,
				shadowBlur:						this.canvas.shadowBlur,
				shadowColor:					this.canvas.shadowColor,
				font:							this.canvas.font,
				textAlign:						this.canvas.textAlign,
				textBaseline:					this.canvas.textBaseline,
				direction:						this.canvas.direction
			});
		}

		this.restore = function(){
			let props = this.stateQuaue.pop();
			for (let p in props) {
				this.canvas[p] = props[p];
			}
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
			this.clearRect(0,0,this.w,this.h);
		} else {
			var x=box.min_x;
			var y=box.min_y;
			var w=box.max_x-box.min_x;
			var h=box.max_y-box.min_y;
			if (w>0 && h>0) this.clearRect(x,y,w,h);
		}
	}

	toPNG() {
		let png = new Image()
		png.src = this.domElm.toDataURL("image/png");
		return png;
	}

	copy(otherLayer, computeFirst) {
		if (computeFirst) {
			let fromImage = new Image();
			fromImage.src = otherLayer.domElm.toDataURL();
			let thec=this;
			fromImage.onload = function() {
				thec.drawImage(this, 0, 0);
			}
		} else {
			this.drawImage(otherLayer.domElm, 0, 0);
		}
	}

	resize(x,y,w,h){
		let backupBuffer = this.getImageData(0, 0, this.w, this.h);
		let newx = this.x-x;
		let newy = this.y-y;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.putImageData(backupBuffer, newx, newy);
		this.boundingBox = new BoundingBox({min_x:this.x,min_y:this.y,max_x:this.w-1,max_y:this.h-1});
	}

}
