/********************************************************
	QUADBEZIER.js – microbians.com
	Math extensions bezier operations

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

// Check my math docs about it
// https://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_offsetting_with_selective_subdivision.pdf
// https://microbians.com/math/Gabriel_Suchowolski_Quadratic_bezier_through_three_points_and_the_-equivalent_quadratic_bezier_(theorem)-.pdf

class QuadBezier {
	constructor(p1,pc,p2, bezierThroughThreePoints) {
		this.p1 = new Vector(p1);
		this.pc = new Vector(pc);
		this.p2 = new Vector(p2);
		this.length = undefined;
		this.bendT = undefined;
		this.bendP = undefined;

		if ( bezierThroughThreePoints ) {
			this.pc = this.control3PointsAuto();
		}

		this.t     = this.closestTtoPc();
		this.n     = this.normalVectorAtT(this.t);
		this.pt    = this.getPointAtT(this.t);
		this.angle = this.ang()
		this.sgn   = this.clockwise();

	}

	closestTtoPc(pc) {

		let tToReturn;

/////////////// FAST NOT SAME BUT SIMILAR
/*
		var p1=this.p1;
		var p2=this.p2;
		if (!pc) var pc=this.pc;

		let d1 = p1.distance(pc);
		let d2 = p2.distance(pc);
		if (d1+d2>0) {
			return d1/(d1+d2);
		} else {
			return .5;
		}
*/
///////////////

		if (pc && pc.isEqual(this.pc) && this.bendT!=undefined) {

			return this.bendT;

		} else {

			var p1=this.p1;
			var p2=this.p2;
			if (!pc) var pc=this.pc;

			var v0=pc.sub(p1);
			var v1=p2.sub(pc);

			var c0 = -v0.dpr(v0);
			var c1 = 3*v0.dpr(v0)-v1.dpr(v0);
			var c2 = 3*(v1.dpr(v0)-v0.dpr(v0))
			var c3 = (v1.sub(v0)).dpr(v1.sub(v0))

			var roots=new Array();

			var a1 = c2 / c3;
			var a2 = c1 / c3;
			var a3 = c0 / c3;

			var Q = (a1 * a1 - 3 * a2) / 9;
			var R = (2 * a1 * a1 * a1 - 9 * a1 * a2 + 27 * a3) / 54;
			var Qcubed = Q * Q * Q;
			var d = Qcubed - R * R;

			// Three real roots
			if (d >= 0) {
				var theta = Math.acos(R / Math.sqrt(Qcubed));
				var sqrtQ = Math.sqrt(Q);
				roots[0] = -2 * sqrtQ * Math.cos( theta                / 3) - a1 / 3;
				roots[1] = -2 * sqrtQ * Math.cos((theta + 2 * Math.PI) / 3) - a1 / 3;
				roots[2] = -2 * sqrtQ * Math.cos((theta + 4 * Math.PI) / 3) - a1 / 3;
			}

			// One real root
			else {
				var e = Math.pow(Math.sqrt(-d) + Math.abs(R), 1/3);
				if (R>0) e=-e;
				roots[0] = (e + Q / e) - a1 / 3.;
			}

			for( var i = 0 ; i < roots.length ; i++ ) {
				var t = roots[i];
				if ( 0 <= t && t <= 1 ) {
					if (IsNum(t)) {
						tToReturn = t;
						break;
					} else {
						let d1 = p1.distance(pc);
						let d2 = p2.distance(pc);
						if (d1+d2>0) {
							tToReturn = d1/(d1+d2);
							break;
						}
						else {
							tToReturn = .5;
							break;
						}
					}
				}
			}
		}
		if (pc.isEqual(this.pc)) {
			this.bendT = tToReturn;
		}
		return tToReturn;
	}

	// Control point of a segment of the QuadBezier
	getSegment(t0, t1) {
		let np1=this.getPointAtT(t0);
		// npc comes using the De Casteljau's algorithm -> https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
		let npc=this.getControlPointOfASegment(t0,t1);
		let np2=this.getPointAtT(t1);
		return new QuadBezier(np1, npc, np2);
	}

	// Control point of a segment
	getControlPointOfASegment(t0, t1) {
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

	// Return the slope (radians) to the quadratic bezier at t
	slopeAtT(t) {
		let d=this.slopeVectorAtT(t);
		if (d.x!=0) return d.y/d.x;
		else        return null
	}

	// Return the quadratic bezier second derivate
	seconDerivateVector(){
		// F''(t) = 2(p1-2pc+p2)
		//{x: 2*(p1.x - 2*pc.x + p2.x) ,y: 2*(p1.y - 2*pc.y + p2.y)}
		return (p1.sub(pc.mul(2)).add(p2)).mul(2);
	}

	// Angle between p1 pc p2 (radians)
	ang(sgn){
		if (!sgn) {
			return Vector.ang3(this.p1, this.pc, this.p2);
		} else {
			return Math.abs( Vector.ang3(this.p1, this.pc, this.p2) );
		}
	}

	clockwise() {
		return Vector.clockwise(this.p1,this.pc,this.p2);
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

		let d1=this.slopeVectorAtT(t);
		let d2=this.seconDerivateVector();
		return d1.cpr(d2) / Math.pow(d1.dpr(d1),3/2);
	}

	// Returns de control point of a quadratic bezier that pass from three points
	control3Points(t) {
	  	let t1 = 1-t;
	  	let tSq= t*t;
	  	let denom = 2*t*t1;

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
		let t =  (slope*(this.pc.x-this.p1.x)-(this.pc.y-this.p1.y)) / ((this.p1.y-2*this.pc.y+this.p2.y)-slope*(this.p1.x-2*this.pc.x+this.p2.x))

		if (t>=0&&t<=1) 	return t; // There is a t with slope
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

	getOffsetingDataAt(t, d1, d2) {
		let data={};

		data.t  = t;

		if (t==0) 		{
			data.p = this.p1;
			data.d = d1;
			data.n = this.p1.vec(this.pc).per().uni();
		} else if(t==1) {
			data.p = this.p2;
			data.d = d2;
			data.n = this.pc.vec(this.p2).per().uni();
		} else {
			data.n  = this.normalUnitVectorAtT(t);
			data.p = this.getPointAtT(t);
			data.d = Math.lerp(d1, d2, this.getSegment(0,t).getLength()/this.getLength() );
		}

		data.l = (data.p).add( (data.n).mul( +data.d/2) );
		data.r = (data.p).add( (data.n).mul( -data.d/2) );

		return data;
	}

	splitCurve(t1,t2) {
		if (!t2) { // Just 1 cut -> return two beziers
			let b1 = b.getSegment(0,t1);
			let b2 = b.getSegment(t1,1);
			return { b1:b1, b2:b2 };
		} else { // A segment return the segment
			return { b1:b.getSegment(0,t1) , b2:b.getSegment(t,11) };
		}
	}

	splitCurve(t) {
		return { b1:b.getSegment(0,t) , b2:b.getSegment(t,1) };
	}

	getLength() {
		if (this.length==undefined) {

			let p1=this.p1;
			let pc=this.pc;
			let p2=this.p2;

			// http://segfaultlabs.com/graphics/qbezierlen/
			let a = p1.sub(pc.mul(2)).add(p2); // p1-2pc+p2
			let b = pc.mul(2).sub(p1.mul(2));  // 2(pc-p1)

			let A = 4*a.length2();
			let B = 4*a.dpr(b);
			let C = b.length2();

			let Sabc = 2*Math.sqrt(A+B+C);
			let A_2 = Math.sqrt(A);
			let A_32 = 2*A*A_2;
			let C_2 = 2*Math.sqrt(C);
			let BA = B/A_2;

			let lng = ( A_32*Sabc + A_2*B*(Sabc-C_2) + (4*C*A-B*B)*Math.log( (2*A_2+BA+Sabc)/(BA+C_2) ) )/(4*A_32);

			if (IsNum(lng)) {
				this.length = lng; // Cache the length
			} else {
				let pt=this.getPointAtT(this.closestTtoPc());
				this.length = p1.distance(pt)+pt.distance(p2);  // Cache the length
			}
		}
		return this.length; // Cache the length
	}

	lineIntersect(a1, a2) {

		var p1 = this.p1;
		var p2 = this.pc;
		var p3 = this.p2;

		var intersections = [];

		// inverse line normal
		var normal = {
		    x: a1.y - a2.y,
		    y: a2.x - a1.x,
		}

		// Q-coefficients
		var c2 = {
		    x: p1.x + p2.x * -2 + p3.x,
		    y: p1.y + p2.y * -2 + p3.y
		}

		var c1 = {
		    x: p1.x * -2 + p2.x * 2,
		    y: p1.y * -2 + p2.y * 2,
		}

		var c0 = {
		    x: p1.x,
		    y: p1.y
		}

		// Transform to line
		var coefficient = a1.x * a2.y - a2.x * a1.y;
		var a = normal.x * c2.x + normal.y * c2.y;
		var b = (normal.x * c1.x + normal.y * c1.y) / a;
		var c = (normal.x * c0.x + normal.y * c0.y + coefficient) / a;

		// solve the roots
		var roots = [];
		d = b * b - 4 * c;
		if (d > 0) {
		    var e = Math.sqrt(d);
		    roots.push((-b + Math.sqrt(d)) / 2);
		    roots.push((-b - Math.sqrt(d)) / 2);
		} else if (d == 0) {
		    roots.push(-b / 2);
		}

		// calc the solution points
		for (var i = 0; i < roots.length; i++) {
		    var minX = Math.min(a1.x, a2.x);
		    var minY = Math.min(a1.y, a2.y);
		    var maxX = Math.max(a1.x, a2.x);
		    var maxY = Math.max(a1.y, a2.y);
		    var t = roots[i];
		    if (t >= 0 && t <= 1) {
		        // possible point -- pending bounds check
		        var point = new Vector({
		            x: Math.lerp(Math.lerp(p1.x, p2.x, t), Math.lerp(p2.x, p3.x, t), t),
		            y: Math.lerp(Math.lerp(p1.y, p2.y, t), Math.lerp(p2.y, p3.y, t), t)
		        });
		        var x = point.x;
		        var y = point.y;
		        // bounds checks
		        if (a1.x == a2.x && y >= minY && y <= maxY) {
		            // vertical line
		            intersections.push(point);
		        } else if (a1.y == a2.y && x >= minX && x <= maxX) {
		            // horizontal line
		            intersections.push(point);
		        } else if (x >= minX && y >= minY && x <= maxX && y <= maxY) {
		            // line passed bounds check
		            intersections.push(point);
		        }
		    }
		}
		return intersections;
	}

}
