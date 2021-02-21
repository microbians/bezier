/********************************************************
	CANVAS.js – microbians.com
	Create canvas and all the s**t
********************************************************/

class Path {
	constructor() {
		this.type = 'Path';
		this.parent = undefined;
		this.layer = undefined;

		this.id = `path[${Path.UID++}]`; // unique ID

		this.strokeStyle = undefined;
		this.fillStyle 	 = undefined;
		this.lineWidth 	 = undefined;

		this.boundingBox 	= new BoundingBox();

		this.dirty = false;

	}

	render(layer, order, renderFn) {
		layer.canvas.beginPath();

		layer.canvas.fillStyle 		= this.fillStyle;
		layer.canvas.strokeStyle 	= this.strokeStyle;
		layer.canvas.lineWidth 		= this.lineWidth;

		renderFn.call(this);

		if (order<0) {
			this.lineWidth && this.strokeStyle && layer.canvas.stroke();
			this.fillStyle && layer.canvas.fill();
		} else {
			this.fillStyle && layer.canvas.fill();
			this.lineWidth && this.strokeStyle && layer.canvas.stroke();
		}

		layer.canvas.closePath();
	}
}
Path.UID = 0; // unique ID

class Circle extends Path {
	// new Circle( {x:100, y:100, radius:50, strokeStyle, fillStyle, } )
	constructor(obj) {
		super();

		// To rewrite the original Path functions this must be call before anything and after super(Path)
		this.PathRender=Path.prototype.render; // Call the function form Path.render

		this.objType = "Circle";
		this.radius = obj.radius;
		this.x = obj.x;
		this.y = obj.y;
	}

	get radius() { return this._radius; }
	set radius(r) {
		if (this._radius!=r) {
			this._radius = Math.max(Number.MIN_VALUE,r);
			this.updateBoundingBox();
		}
	}

	get x() { return this._x; }
	set x(x) {
		if (this._x!=x) {
			this._x = x;
			this.updateBoundingBox();
		}
	}

	get y() { return this._y; }
	set y(y) {
		if (this._y!=y) {
			this._y = y;
			this.updateBoundingBox();
		}
	}

	updateBoundingBox() {
		let x1=this._x-this._radius-(this.lineWidth||0);
		let y1=this._y-this._radius-(this.lineWidth||0);
		let x2=this._x+this._radius+(this.lineWidth||0);
		let y2=this._y+this._radius+(this.lineWidth||0);

		this.boundingBox.set( {
			min_x: x1,
			min_y: y1,
			max_x: x2,
			max_y: y2
		});

		this.dirty=true;
	}

	render(layer, order) {
		this.PathRender(layer,order, ()=>{ // Call the function form Path.render
			let x = 0;
			let y = 0;
			layer.canvas.arc( x + this.x, y + this.y, this.radius, 0, Math.PI*2);
		});
	}

	hitTest(el) {
		return ( Math.distance2({x:el.x,y:el.y},{x:this.x,y:this.y})<=(this.radius+el.radius+(this.lineWidth||0)+(this.lineWidth||0))*(this.radius+el.radius+(this.lineWidth||0)+(this.lineWidth||0)) );
	}
}
Path.Circle = Circle;

class Rect extends Path {
	// new Circle( {x:100, y:100, radius:50, strokeStyle, fillStyle, } )
	constructor(obj) {
		super();

		// To rewrite the original Path functions this must be call before anything and after super(Path)
		this.PathRender=Path.prototype.render; // Call the function form Path.render

		this.objType = "Rect";
		this.x = obj.x;
		this.y = obj.y;
		this.w = obj.w;
		this.h = obj.h;
	}

	get x()  { return this._x; }
	set x(x) {
		if (this._x!=x) {
			this._x = x;
			this.updateBoundingBox();
		}
	}

	get y() { return this._y; }
	set y(y) {
		if (this._y!=y) {
			this._y = y;
			this.updateBoundingBox();
		}
	}

	get w() { return this._w; }
	set w(w) {
		if (this._w!=w) {
			this._w = w;
			this.updateBoundingBox();
		}
	}

	get h() { return this._h; }
	set h(h) {
		if (this._h!=h) {
			this._h = h;
			this.updateBoundingBox();
		}
	}

	updateBoundingBox() {
		let x1=this._x-(this.lineWidth||0);
		let y1=this._y-(this.lineWidth||0);
		let x2=this._x+this._w+(this.lineWidth||0);
		let y2=this._y+this._h+(this.lineWidth||0);

		this.boundingBox.set( {
			min_x: x1,
			min_y: y1,
			max_x: x2,
			max_y: y2
		});

		this.dirty=true;
	}

	render(layer, order) {
		this.PathRender(layer,order, ()=>{ // Call the function form Path.render
			layer.canvas.rect( this.x, this.y, this.w, this.h);
		});
	}

	hitTest(el) {
		// TODO
	}
}
Path.Rect = Rect;
