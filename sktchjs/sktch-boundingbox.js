/********************************************************
	BoundingBox
	- microbians.com
********************************************************/

class BoundingBox {
	constructor(box, data) {
		if (box) this.set(box);
		else     this.reset();
		if (data) setData(data);
	}
	reset() {
		this.min_x = Infinity;
		this.min_y = Infinity;
		this.max_x = -Infinity;
		this.max_y = -Infinity;
	}
	grow(box) {
		this.min_x = Math.min(this.min_x,box.min_x);
		this.min_y = Math.min(this.min_y,box.min_y);
		this.max_x = Math.max(this.max_x,box.max_x);
		this.max_y = Math.max(this.max_y,box.max_y);
	}
	setData(data){
		this.data=data;
	}
	set(box) {
		this.min_x = box.min_x;
		this.min_y = box.min_y;
		this.max_x = box.max_x;
		this.max_y = box.max_y;
	}
	isIntersect(box) {
		return this.min_x <= box.max_x
        && this.max_x >= box.min_x
        && this.min_y <= box.max_y
        && this.max_x >= box.min_y;
	}
}
