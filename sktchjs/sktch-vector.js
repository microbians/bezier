/********************************************************
	VECTOR.js – microbians.com
	Math extensions for vector operations
********************************************************/
 
// Vector/Point Class
class Vector {
	constructor(x, y) {
		if (typeof x =="object") {
			this.x=x.x;
			this.y=x.y;
		} else {
			this.x=x;
			this.y=y;
		}
	}

	slope(){
		return this.y/this.x;
	}
	new() { // A new copy the vector object
		return new Vector(this)
	}
	add(B){ // VECTOR ADITION
		return new Vector( this.x+B.x, this.y+B.y );
	}
	sub(B) { // VECTOR SUBSTRACTION
		return new Vector( this.x-B.x, this.y-B.y );
	}
	vec(B) { // A, B as points get the vector from A to B
		return new Vector( B.x-this.x, B.y-this.y );
	}
	mul(n){ // VECTOR MULTIPLICATION BY SCALAR
		return new Vector( this.x*n, this.y*n );
	}
	div(n){ // VECTOR DIVISION BY SCALAR
		return new Vector( this.x/n, this.y/n );
	}
	per() { // PERPENDICULAR ROTATION OF VECTOR A
		return new Vector( this.y, -this.x );
	}
	dpr(B) { // DOT PRODUCT (INNER PRODUCT) A · B
		return this.x*B.x + this.y*B.y;
	}
	cpr(B) { // CROSS PRODUCT (OUTER PODUCT) | A X B |
		return this.x*B.y - B.x*this.y
	}
	pry(B) { // PROYECT A over B
		return this.dpr(B)/B.length();
	}
	uni() { // UNIT VECTOR
		var d=this.length();
		return this.div(d);
	}

	length2() { // Length of the vector squared
		return this.x*this.x + this.y*this.y;
	}
	length() { // Length of the vector
		return Math.sqrt(this.length2());
	}
	distance2(B) { // Distance length from A to B squared
		var dif = this.sub(B);
		return dif.x*dif.x + dif.y*dif.y;
	}
	distance(B) { // Distance length from A to B
		return Math.sqrt(this.distance2(B));
	}
	ang(B) {  // Ang between vector A and vector B in radians
		return Math.atan2( this.cpr(B) , this.dpr(B) );
	}
	med(B) { // Mean between two vectors or mid point between two points
		return this.add(B).mul(.5);
	}
	rot(r) { // Vector rotation by r (radians)
		return new Vector( this.x*Math.cos(r)-this.y*Math.sin(r), this.y*Math.cos(r)+this.x*Math.sin(r) );
	}
	isVec() { // Checks that vector componets are numbers (not NaN)
		return IsNum(this.x) && IsNum(this.y);
	}
	isEqual(B) { // Check of two vectors or points are the seame
		return (this.x==B.x && this.y==B.y);
	}
	lrp(B,t) { // Interpolate vector A to B with a scalar t
		return this.add(this.vec(B).mul(t));
	}
	int(B, from, to, cur) { // Interpolate from this to B when curVAL goes fromVAL => toVAL
		var t = (Math.clamp(from,to)-from) / (to-from);
		return this.mul(1-t).add(B.mul(s));
	}
}
Vector.ang3 = function(p1,pc,p2) { // this, B and C as points and return the angle btetween the three points
		var v1 = pc.vec(p1);
		var v2 = pc.vec(p2);
		return v1.ang(v2);
}
Vector.clockwise=function(p1,pc,p2){
	return Math.isLeft(p1,pc,p2)>0;
}
Vector.isLeft=function(p1,pc,p2){
	//  isLeft: >0 for counterclockwise
	//          =0 for none (degenerate)
	//          <0 for clockwise
	return ( (pc.x-p1.x)*(p2.y-p1.y)-(p2.x-p1.x)*(pc.y-p1.y));
}
