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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Colosest T to Pc
Math.quadBezierClosestTtoPc = function( p1,pc,p2 ) {
	var d1 = Math.distance(pc,p1);
	var d2 = Math.distance(pc,p2);
	if (d1+d2 == 0) return .5; // Avoid divide by 0
	return d1/(d1+d2);
}

// Casteljau piecevise
Math.quadBezierCasteljau = function ( p1 , p2 , t ) {
	return { x: (1-t)*p1.x + t*p2.x ,y: (1-t)*p1.y+t*p2.y };
}

// Control point of a segment
Math.quadBezierGetSegment = function ( p1,pc,p2, t0, t1 ) {
	var np1=Math.quadBezierGetPointAtT(p1,pc,p2, t0);
	var npc=Math.quadBezierCasteljau(Math.quadBezierCasteljau(p1, pc, t0), Math.quadBezierCasteljau(pc, p2, t0), t1);
	var np2=Math.quadBezierGetPointAtT(p1,pc,p2, t1);
	return {p1:np1, pc:npc, p2:np2};
}

// Control point of a segment
Math.quadBezierGetControlPointOfASegment = function ( p1,pc,p2, t0, t1 ) {
	return Math.quadBezierCasteljau(Math.quadBezierCasteljau(p1, pc, t0), Math.quadBezierCasteljau(pc, p2, t0), t1);
}

// Get the point at t
Math.quadBezierGetPointAtT = function(p1,pc,p2, t) {
	var p=Math.quadBezierCasteljau(Math.quadBezierCasteljau(p1, pc, t), Math.quadBezierCasteljau(pc, p2, t), t);
	return p;
}

// Return the quadratic first derivate vaule at t == slope vector (not unified) (velocity)
Math.quadBezierSlopeVectorAtT=function(p1, pc, p2, t){
	// F'(t) = 2((1-t)(pc-p1)+t(p2-p1))
	//       = 2(t(p1-2pc+p2)+(pc-p1)
	return {x: 2*(t*(p1.x - 2*pc.x + p2.x) + (pc.x- p1.x)), y: 2*(t*(p1.y - 2*pc.y + p2.y) + (pc.y- p1.y))}
}

// Return the quadratic bezier second derivate
Math.quadBezierSeconDerivateVector = function(p1, pc, p2){
	// F''(t) = 2(p1-2pc+p2)
	return {x: 2*(p1.x - 2*pc.x + p2.x) ,y: 2*(p1.y - 2*pc.y + p2.y)}
}

// Return the slope (radians) to the quadratic bezier at t
Math.quadBezierSlopeAtT=function (p1, pc, p2, t) {
	var d=Math.quadBezierSlopeVectorAtT(p1,pc,p2,t);
	if (d.x!=0) return d.y/d.x;
	else        return null
}

// Return the normal unit vector at t
Math.quadBezierNormalUnitVectorAtT = function(p1, pc, p2, t) {
	return Math.vPER(Math.vUNI(Math.quadBezierSlopeVectorAtT(p1,pc,p2,t)));
}

// Return the normal vector at t
Math.quadBezierNormalVectorAtT = function(p1, pc, p2, t) {
	return Math.vPER(Math.quadBezierSlopeVectorAtT(p1,pc,p2,t));
}

// Vertex
Math.quadBezierVertex=function(p1,pc,p2){
	var vm = -(pc.x-.5*p2.x-.5*p1.x)/(pc.y-.5*p2.y-.5*p1.y);
	var vt = (-vm*(pc.x-p1.x)+(pc.y-p1.y))/(vm*(p1.x-2*pc.x+p2.x)-(p1.y-2*pc.y+p2.y));
	return vt
}

// Quadratic Bezier Curvature
Math.quadBezierCurvature = function (p1, pc, p2, t) {
	// k(t) = | F'(t) x F''(t) | / ||F'(t)||^3
    //      = (x'(t)y''(t)-x''(t)y'(t)) / pow(x'(t)^2+y'(t)^2,3/2)
	//      = |4(pc-p1) x (p1-2pc+p2)| / ||F'(t)||^3
	//		= 8A  / ||F'(t)||^3
	// Donde A es el area del triángulo P1-PC-P2 => A=|vec(PC,P1) X vec(PC,P2)|/2
	// var A=Math.vCPR(Math.vVEC(p1,pc),Math.vVEC(pc,p2))/2
	// return 8*A/Math.pow(Math.vDPR(d1,d1),3/2)

	var d1=Math.quadBezierSlopeVectorAtT(p1,pc,p2,t)
	var d2=Math.quadBezierSeconDerivateVector(p1,pc,p2)
	return Math.vCPR(d1,d2)/Math.pow(Math.vDPR(d1,d1),3/2)
}

// Returns de control point of a quadratic bezier that pass from three points
Math.quadBezierControl3Points=function(p0,p1,p2,t) {
  	var t1 = 1-t;
  	var tSq= t*t;
  	var denom = 2*t*t1;

  	var cx = (p1.x - t1*t1*p0.x - tSq*p2.x)/denom;
  	var cy = (p1.y - t1*t1*p0.y - tSq*p2.y)/denom;

	return {x:cx, y:cy}
}

// Returns de control point of a quadratic bezier that pass from three points (AUTO T)
Math.quadBezierControl3PointsAuto=function(p1,pc,p2) {
	return Math.quadBezierControl3Points(p1,pc,p2, Math.quadBezierClosestTtoPc(p1,pc,p2));
}


// Return t for a slope
Math.quadBezierTforSlope = function( p1, pc, p2, slope ) {
	var newPMt=(slope*(pc.x-p1.x)-(pc.y-p1.y)) / ((p1.y-2*pc.y+p2.y)-slope*(p1.x-2*pc.x+p2.x))
	if (newPMt>=0&&newPMt<=1) 	return newPMt
	else 						return null
}

// Return t for a angle (radianes)
Math.quadBezierTforAngle = function( p1, pc, p2, ang ) {
	var vAngle=Math.vUNI(Math.vROT({x:1,y:0},ang));
	var nslope=-vAngle.y/vAngle.x
	// Toma el t cuya tangente es nslope
	var newPMt=(nslope*(pc.x-p1.x)-(pc.y-p1.y)) / ((p1.y-2*pc.y+p2.y)-nslope*(p1.x-2*pc.x+p2.x))
	if (newPMt>=0&&newPMt<=1) 	return newPMt
	else 						return null
}

// Return t for a angle (vector)
Math.quadBezierTtangentToVector = function( p1, pc, p2, vAngle ) {
	var nslope=vAngle.y/vAngle.x
	// Toma el t cuya tangente es nslope
	var newPMt=(nslope*(pc.x-p1.x)-(pc.y-p1.y)) / ((p1.y-2*pc.y+p2.y)-nslope*(p1.x-2*pc.x+p2.x))
	if (newPMt>=0&&newPMt<=1) 	return newPMt
	else 						return null
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// VECTORS
////////////////////////////////////////////////////////////////////////////////
// Slope of a stright line (point to point)
Math.strightLineSlope=function(A,B){
	return (B.y-A.y)/(B.x-A.x)
}

// VECTORS
//////////////////////////////////////////////////////////////////////////////////////
Math.vADD=function(A,B)   { return {x:A.x+B.x,y:A.y+B.y} }	// VECTOR SUBSTRACTION
Math.vSUB=function(A,B)   { return {x:A.x-B.x,y:A.y-B.y} }	// VECTOR ADITION
Math.vMUL=function(A,n)   { return {x:A.x*n  ,y:A.y*n  } }	// VECTOR MULTIPLICATION BY SCALAR
Math.vDIV=function(A,n)   { return {x:A.x/n  ,y:A.y/n  } }	// VECTOR DIVISION BY SCALAR
Math.vPER=function(A)     { return {x:A.y    ,y:-A.x   } }	// PERPENDICULAR ROTATION OF VECTOR A
Math.vDPR=function(A,B)   { return A.x*B.x+A.y*B.y; } 		// DOT PRODUCT   (INNER PRODUCT) 	  A · B
Math.vCPR=function(A,B)   { return A.x*B.y-B.x*A.y; }		// CROSS PRODUCT (OUTER PODUCT)     | A X B |
Math.vLRP=function(A,B,t) { return Math.vADD(A, Math.vMUL(Math.vVEC(A,B),t) ) }

// VECTOR DE A a B
Math.vVEC=function(A,B) { return Math.vSUB(B,A) }			// VECTOR FROM A to B

// PROYECT A over B
Math.vPRY=function(A,B){
	return Math.vDPR(A,B)/Math.distance(B)
}

// VECTOR UNIDAD
Math.vUNI=function(A) {
	var d=Math.distance({x:0,y:0},A);
	return {x:A.x/d, y:A.y/d}
}

// ANGULO ENTRE VECTORES A y B
Math.vANG=function(A,B) { return Math.atan2( Math.vCPR(A,B) , Math.vDPR(A,B) ) }

// ANGULO ENTRE PUNTOS P1 PC P2
Math.vANG3=function(P1,PC,P2) {
	var A=Math.vVEC(PC,P1)
	var B=Math.vVEC(PC,P2)
	return Math.vANG(A,B)
}


// VECTOR MEDIO
Math.vMED=function(A,B) { return Math.vMUL(Math.vADD(A,B),.5) }

// ROTACION DE UN VECTOR EN ANGULO r
Math.vROT=function(A,r) { return {x:A.x*Math.cos(r)-A.y*Math.sin(r), y:A.y*Math.cos(r)+A.x*Math.sin(r) } }

// RETORNA true si es un vector y false si no lo es
Math.isVEC=function(A) { return IsNum(A.x)&&IsNum(A.y) }

// VECTORES IGUALES?
//////////////////////////////////////////////////////////////////////////////////////
Math.vEQL=function(A,B) { return (A.x==B.x && A.y==B.y) }

// Interpolate from A to B when curVAL goes fromVAL => toVAL
Math.vINT=function(A,B, fromA,toB, cur){
	if (fromA==toB) return Math.vMED(A,B);
	var tmpCur=cur
	if (cur<fromA) tmpCur=fromA
	if (cur>fromB) tmpCur=fromB
	var iSCALAR=(tmpCur-fromA)/(toB-fromA)
	return Math.vADD( Math.vMUL(A,1-iSCALAR), Math.vMUL(B,iSCALAR))
}

// Interpolation form p1 to p2 when n from 0 to 1
Math.pINT=function(p1,p2,n){
	// p1*(1-n)+p2*(n)
	return Math.vADD(Math.vMUL(p1,(1-n)), Math.vMUL(p2,n))
}

// THREE POINT
//////////////////////////////////////////////////////////////////////////////////////
Math.clockwise=function(p1,p2,p3){
	return Math.isLeft(p1,p2,p3)>0;
}

Math.isLeft=function(p1,p2,p3){
	//  isLeft: >0 for counterclockwise
	//          =0 for none (degenerate)
	//          <0 for clockwise
	return ( (p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y));
}
