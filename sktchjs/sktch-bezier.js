/********************************************************
	QUADBEZIER.js – microbians.com
	Math extensions bezier operations
********************************************************/
 
// Check my math docs about it
// https://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
// https://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_through_three_points_and_the_-equivalent_quadratic_bezier_(theorem)-.pdf

class QuadBezier {
	constructor(p1,pc,p2) {
		this.p1 = new Vector(p1);
		this.pc = new Vector(pc);
		this.p2 = new Vector(p2);
	}

	closestTtoPc(){
		var d1 = this.pc.distance(this.p1);
		var d2 = this.pc.distance(this.p2);
		if (d1+d2 == 0) return .5; // Avoid divide by 0
		return d1/(d1+d2);
	}

	// Control point of a segment of the QuadBezier
	getSegment(t0, t1 ) {
		var np1=this.getPointAtT(t0);
		// npc comes using the De Casteljau's algorithm -> https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
		var npc=this.getControlPointOfASegment(t0,t1);
		var np2=getPointAtT(t1);
		return new QuadBezier(np1, npc, np2);
	}

	// Control point of a segment
	getControlPointOfASegment(t0, t1 ) {
		return this.p1.lrp(this.pc, t0).lrp( this.pc.lrp(this.p2, t0), t1);
	}

	// Get the point at t
	getPointAtT(t) {
		// return getControlPointOfASegment(t, t);
		return this.p1.lrp(this.pc, t).lrp( this.pc.lrp(this.p2, t), t);
	}

	// Return the quadratic first derivate vaule at t == slope vector (not unified) (velocity)
	slopeVectorAtT(t) {
		// F'(t) = 2((1-t)(pc-p1)+t(p2-p1))
		//       = 2(t(p1-2pc+p2)+(pc-p1)
		// {x: 2*(t*(p1.x - 2*pc.x + p2.x) + (pc.x- p1.x)), y: 2*(t*(p1.y - 2*pc.y + p2.y) + (pc.y- p1.y))}
		return (((this.p1.sub(this.pc.mul(2)).add(this.p2)).mul(t)).add(this.pc.sub(this.p1))).mul(2);
	}

	// Return the quadratic bezier second derivate
	seconDerivateVector(){
		// F''(t) = 2(p1-2pc+p2)
		//{x: 2*(p1.x - 2*pc.x + p2.x) ,y: 2*(p1.y - 2*pc.y + p2.y)}
		return (p1.sub(pc.mul(2)).add(p2)).mul(2);
	}

	// Return the slope (radians) to the quadratic bezier at t
	slopeAtT(t) {
		var d=this.slopeVectorAtT(t);
		if (d.x!=0) return d.y/d.x;
		else        return null
	}

	// Angle between p1 pc p2 (radians)
	ang(){
		return Vector.ang3(this.p1, this.pc, this.p2);
	}

	angDegrees(){
		return Math.toDegrees(this.ang());
	}

	// Return the normal unit vector at t
	normalUnitVectorAtT(t) {
		return this.normalVectorAtT(t).uni();
	}

	// Return the normal vector at t
	normalVectorAtT(t) {
		return this.slopeVectorAtT(t).per();
	}

	// Quadratic Bezier Curvature
	curvature(t) {
		// k(t) = | F'(t) x F''(t) | / ||F'(t)||^3
	    //      = (x'(t)y''(t)-x''(t)y'(t)) / pow(x'(t)^2+y'(t)^2,3/2)
		//      = |4(pc-p1) x (p1-2pc+p2)| / ||F'(t)||^3
		//		= 8A  / ||F'(t)||^3
		// Where A is the triangle area P1-PC-P2 => A=|vec(PC,P1) X vec(PC,P2)|/2
		// var A=Math.vCPR(Math.vVEC(p1,pc),Math.vVEC(pc,p2))/2
		// return 8*A/Math.pow(Math.vDPR(d1,d1),3/2)

		var d1=this.slopeVectorAtT(t);
		var d2=this.seconDerivateVector();
		return d1.cpr(d2) / Math.pow(d1.dpr(d1),3/2);
	}

	// Returns de control point of a quadratic bezier that pass from three points
	control3Points(t) {
	  	var t1 = 1-t;
	  	var tSq= t*t;
	  	var denom = 2*t*t1;

		//var cx = (pc.x - t1*t1*p1.x - tSq*p2.x)/denom;
	  	//var cy = (pc.y - t1*t1*p1.y - tSq*p2.y)/denom;
		return (this.pc.sub( this.p1.mul(t1*t1) ).sub( this.p2.mul(tSq) )).div(denom);
	}

	// Returns de control point of a quadratic bezier that pass from three points
	// where the tension tends to pc, so the point at T must be the nearest one to pc
	control3PointsAuto() {
		return this.control3Points( this.closestTtoPc() );
	}

	// Return t for a slope
	// Given a slope return the t wich had this slope
	TforSlope( slope ) {
		var t =  (slope*(this.pc.x-this.p1.x)-(this.pc.y-this.p1.y)) / ((this.p1.y-2*this.pc.y+this.p2.y)-slope*(this.p1.x-2*this.pc.x+this.p2.x))

		if (t>=0&&t<=1) 	return newPMt; // There is a t with slope
		else 				return undefined; // Is not a t with that slope
	}

	// Return t for a angle (radians)
	TforAngle(ang) {
		return this.TforSlope( Math.tan(ang) );
	}

	// Return t for a angle (degrees)
	TforAngleDegrees(ang) {
		return this.TforSlope( Math.tan(ang*180/Math.PI) );
	}

	// Return t for a angle (vector)
	TtangentToVector(v) {
		return this.TforSlope( v.slope() );
	}

}

