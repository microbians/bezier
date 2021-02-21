/********************************************************
	CANVAS.js – microbians.com
	Create canvas and all the s**t
********************************************************/

class Group {
	constructor(id) {
		this.type = 'Group';
		this.parent = undefined;
		this.layer = undefined;
		this.elements = [];

		if (!id) this.id = `Group[${Group.UID++}]`; // unique ID

		this.x = 0;
		this.y = 0;

		this.resetBoundingBox();
		this.resetDirtyBox();
	}

	get x() { return this._x; }
	set x(x) {
		if (this._x!=x) {
			this._x = x;
		}
	}

	get y() { return this._y; }
	set y(y) {
		if (this._y!=y) {
			this._y = y;
		}
	}

	append(el) {
		el.parent = this;
		this.elements.push(el);
	}
	resetBoundingBox() {
		this.boundingBox = {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
	}
	resetDirtyBox() {
		this.dirtyBox = {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
	}
	updateBoundingBox() {
		let tmpBoundingBox= {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
		let el = this.elements;
		for (let i in el) {
			tmpBoundingBox = {
				minX:Math.min(tmpBoundingBox.minX,el[i].boundingBox.minX),
				minY:Math.min(tmpBoundingBox.minY,el[i].boundingBox.minY),
				maxX:Math.max(tmpBoundingBox.maxX,el[i].boundingBox.maxX),
				maxY:Math.max(tmpBoundingBox.maxY,el[i].boundingBox.maxY)
			};
		}
		this.boundingBox = tmpBoundingBox;
	}
	updateDirtyBox() {
		let tmpDirtyBox= {minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
		let el = this.elements;
		for (let i in el) {
			tmpDirtyBox = {
				minX:Math.min(tmpDirtyBox.minX,el[i].dirtyBox.minX),
				minY:Math.min(tmpDirtyBox.minY,el[i].dirtyBox.minY),
				maxX:Math.max(tmpDirtyBox.maxX,el[i].dirtyBox.maxX),
				maxY:Math.max(tmpDirtyBox.maxY,el[i].dirtyBox.maxY)
			};
		}
		this.dirtyBox = tmpDirtyBox;
	}
}
Group.UID=0;
