/********************************************************
	Loose Grids
	for collision detection & all the s**t
	- microbians.com
********************************************************/
  
class Grid {
	constructor(width, height, divider) {
		this.divider = divider;
		this.cellW = Math.floor(width/divider);
		this.cellH = Math.floor(height/divider);
		this.divider = divider; // Num Rows and Cols
		//this.cells = new Array(this.divider*this.divider).fill({}).map(()=>({ boundingBox:new BoundingBox(), elements:[] }))
		this.cells = new Array(this.divider*this.divider).fill({}).map(()=>({ elements:new Set(), dirty:false, oldDirty:false }));
		for (let i=0; i<this.cells.length; i++) {
			this.cells[i].id=i;													// To determine wich cell is in case of filter the array
		}
	}
	getCellX(x) {
		return Math.clamp( Math.floor(x/this.cellW), 0, this.divider-1);
	}
	getCellY(y) {
		return Math.clamp( Math.floor(y/this.cellH), 0, this.divider-1);
	}
	getCellIndexWithCellPosition(cx,cy) {
		return cy * this.divider + cx;
	}
	getCellIndex(x,y) {
		return this.getCellY(y) * this.divider + this.getCellX(x);
	}
	getX(c) {
		return (c % this.divider) * this.cellW;
	}
	getY(c) {
		return Math.floor(c / this.divider) * this.cellH;
	}
	append(el) {
		el.inCells = [];

		if (el.boundingBox.max_x<0 ||
			el.boundingBox.max_y<0 ||
			el.boundingBox.min_x>this.divider*this.cellW ||
			el.boundingBox.min_y>this.divider*this.cellH ) {
			return;
		}

		let minCellX = this.getCellX(el.boundingBox.min_x);
		let minCellY = this.getCellY(el.boundingBox.min_y);
		let maxCellX = this.getCellX(el.boundingBox.max_x);
		let maxCellY = this.getCellY(el.boundingBox.max_y);

		for (let x=minCellX; x<=maxCellX; x++) {
			for (let y=minCellY; y<=maxCellY; y++) {
				let c = this.getCellIndexWithCellPosition(x,y);
				this.cells[c].dirty=true;
				this.cells[c].elements.add(el);						// Add the element to all cells his bounding box cover
				el.inCells.push(c);										// Array with all the index of cell the elements is added
			}
		}
	}
	remove(el) {
		for (let i=0; i<el.inCells.length; i++) {
			let c = el.inCells[i];
			this.cells[c].dirty		= true;
			this.cells[c].elements.delete(el);//splice(this.cells[c].elements.indexOf(el),1);
		}
	}
	update(el) {
		if (el.dirty == false) return;
		for (let i=0; i<el.inCells.length; i++) {
			let c = el.inCells[i];
			this.cells[c].oldDirty	= true;
			this.cells[c].elements.delete(el);//splice(this.cells[c].elements.indexOf(el),1);
		}
		this.append(el);
	}
	cleanDirty(){
		for (let i=0; i<this.cells.length; i++) {
			this.cells[i].oldDirty	= this.cells[i].dirty;
			this.cells[i].dirty		= false;
		}
	}
}
