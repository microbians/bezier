/********************************************************
	Point.js – microbians.com
	Create a Point object and this function operations
	with Fake Point operator
	v1.0. Fake operator constructor
	v1.1. Added cross & dot product
	v1.2. Added better pass variable names as an object

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

class Point {
	constructor(x,y) {
		if (x != undefined) {
			if (x instanceof Array) {                       // In case created from and array new Point([0,0])
				this.x = x[0];
				this.y = x[1];
			} else if (x.constructor.name == "Point") {    // In case created from object Point format new Point({x:0,y:0})
				this.x = x.x;
				this.y = x.y;
			} else if (typeof x == "string" || typeof x == "function"){

				let formulaArgs = [];
				let formulaVals = [];
				let formulaValsX = [];
				let formulaValsY = [];

				for (let name in y) {
					let value = y[name];
					formulaArgs.push("_"+name);
					formulaVals.push(value);
					if (typeof value == "object") { // Is a vector
						formulaValsX.push('let '+name+'=_'+name+'.x;' );
						formulaValsY.push('let '+name+'=_'+name+'.y;' );
					} else { // Is a number veriable
						formulaValsX.push('let '+name+'=_'+name+';' );
						formulaValsY.push('let '+name+'=_'+name+';' );
					}
				}

				formulaArgs = "\""+formulaArgs+"\"";
				formulaValsX = formulaValsX.join("");
				formulaValsY = formulaValsY.join("");

				let formula = (typeof x == "string") ? x.split(" ").join("") : x.toString().split(" ").join("").split("()=>{").join("").split("function(){").join("").split("}")[0];

				//console.log('Cleaned original forumla → '+formula);

				// Dot Product -> this.x*p.x + this.y*p.y
				formula = formula.replace( /([a-zA-Z0-9_-]{1,})\·([a-zA-Z0-9_-]{1,})/g, "(_$1.x*_$2.x+_$1.y*_$2.y)");

				// Cross product -> this.x*p.y - this.y*p.x;
				formula = formula.replace( /([a-zA-Z0-9_-]{1,})\ˣ([a-zA-Z0-9_-]{1,})/g, "(_$1.x*_$2.y-_$1.y*_$2.x)");

				//console.log('Dot or Cross product added → '+formula);

				let functionX = 'return new Function('+formulaArgs+',"'+formulaValsX+'return '+formula+'").call({},'+formulaVals+')';
				let functionY = 'return new Function('+formulaArgs+',"'+formulaValsY+'return '+formula+'").call({},'+formulaVals+')';

				//console.log('Generated Function for X Value → '+functionX);
				//console.log('Generated Function for Y Value → '+functionY);

				this.x = new Function( functionX ).call();
				this.y = new Function( functionY ).call();

				//console.log(this);

			} else {
				let y;
				if (arguments.length > 0) {
					y = arguments[1];
				}
				this.x = x;
				this.y = y;
			}
		}

		this.x = this.x || 0;
		this.y = this.y || 0;
	}

	add(p) {                            // Add two vector Points
		return new Point(this.x+p.x, this.y+p.y);
	}
	sub(p) {                            // Substract two vector Points
		return new Point(this.x-p.x, this.y-p.y);
	}
	mlt(n) {                            // Multiply by escalar
		return new Point(this.x*n, this.y*n);
	}
	neg() {                             // Invert sign of the two components
		return new Point(-this.x, -this.y);
	}
	crs(p) {                            // Cross product → ᚷ
		return this.x*p.y - this.y*p.x;                 // Return number
	}
	dot(p) {                            // Dot product → ·
		return this.x*p.x + this.y*p.y;                 // Return number
	}
	toString() {
		return `{x:${this.x},y:${this.y}}`;
	}
	toArray() {
		return [this.x, this.y ];
	}
}
