/********************************************************
	MATH.js – microbians.com
	Math extensions + Bezier extensions

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

// Global isNum -> Double check is number
IsNum=function(n) {
		if (((Number(typeof n)).toString()== "NaN")&&((Number(n+"")).toString()== "NaN")) return false
		else return true
}

Math.PIHalf   = Math.PI/2;
Math.PIDouble = Math.PI*2;
Math.EPS = 1e-9;

// Math.preciseRound
Math.preciseRound = function(num,precision){
	return  Math.round(num*Math.pow(10,precision))/Math.pow(10,precision);
}

// Math.distance
Math.distance = function(A,B) {
	return Math.sqrt(Math.distance2(A,B));
}

// Math.distance2 – DISTANCE^2
Math.distance2 = function(A,B) {
	var dX = B.x-A.x;
	var dY = B.y-A.y;
	return dX*dX+dY*dY;
}

//Linear Interpolation
Math.cosineInterpolate = function(y1,y2,mu) {
   let mu2 = (1-Math.cos(mu*Math.PI))/2;
   return (y1*(1-mu2)+y2*mu2);
}

//Linear Interpolation
Math.lerp = function(y1,y2,mu) {
   return (y1*(1-mu)+y2*mu);
}

//median
Math.med = function(y1,y2) {
   return (y1+y2)*.5;
}

// Combierte un intervalo en otro de forma lineal
Math.intervalToInterval=function(a1,b1,a2,b2,t){
	return ((b2-a2)/(b1-a1))*(t-a1)+a2;
}

// Radians to toDegrees
Math.toDegrees = function(r) {
	return r*180/Math.PI;
}

// Precise round
Math.preciseRound=function(num,precision){ return  Math.round(num*Math.pow(10,precision))/Math.pow(10,precision)}

// Math clamp the value into a rage
Math.clamp = function(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

// RANDOM
////////////////////////////////////////////////////////////////////////////////
// Math random min max values
Math._random = Math.random;
Math.random = function(min, max) {
	if (max == undefined) {
		if (min != undefined) return Math._random()*min;
		else                  return Math._random();
	}
	return Math._random() * (max - min) + min;
}
random=Math.random;

Math.randomInt = function(min, max) {
    if (max == undefined) {
		max = Math.floor(min);
		min = 0;
	} else {
		min = Math.ceil(min);
		max = Math.floor(max);
	}
    return Math.floor(Math._random() * (max - min + 1)) + min;
}
randomInt=Math.randomInt;

// Function by Kevin Lindsey
Math.circleIntersectCircle = function(c1, r1, c2, r2) {
    var result=[];

    // Determine minimum and maximum radii where circles can intersect
    var r_max = r1 + r2;
    var r_min = Math.abs(r1 - r2);

    // Determine actual distance between circle circles
    var c_dist = c1.distance( c2 );

    if ( c_dist > r_max ) {
//        result = new Intersection("Outside");
    } else if ( c_dist < r_min ) {
//        result = new Intersection("Inside");
    } else {
//        result = new Intersection("Intersection");

        var a = (r1*r1 - r2*r2 + c_dist*c_dist) / ( 2*c_dist );
        var h = Math.sqrt(r1*r1 - a*a);
        var p = c1.lrp(c2, a/c_dist);
        var b = h / c_dist;

        result.push(
            new Vector(
                p.x - b * (c2.y - c1.y),
                p.y + b * (c2.x - c1.x)
            )
        );
        result.push(
            new Vector(
                p.x + b * (c2.y - c1.y),
                p.y - b * (c2.x - c1.x)
            )
        );
    }

    return result;
};

Math.tangentPointsOfaCircleAndPoint=function(c1,r1,p1) {
	let c2 = p1.med(c1);
	let r2 = p1.distance(c2);
	return Math.circleIntersectCircle(c1,r1,c2,r2);
}

// INTERSECT RAYS
// Lite version of "intersectRayRay" by Kevin Lindsey Geometric API
//////////////////////////////////////////////////////////////////////////////////////
Math.intersectRays = function(a1,a2,b1,b2){
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
		var status="intersect"
        var x=a1.x + ua * (a2.x - a1.x)
        var y=a1.y + ua * (a2.y - a1.y)
		return new Vector(x,y);
    } else {
        if ( ua_t == 0 || ub_t == 0 ) {
			var status="equal"
			var x=y=null
        } else {
			var status="parallel"
			var x=y=null
        }
    }
    return undefined;
}

Math.intersectLineCircle = function(a1, a2, c, r) {
    var result = [];
    var a  = (a2.x - a1.x) * (a2.x - a1.x) +
             (a2.y - a1.y) * (a2.y - a1.y);
    var b  = 2 * ( (a2.x - a1.x) * (a1.x - c.x) +
                   (a2.y - a1.y) * (a1.y - c.y)   );
    var cc = c.x*c.x + c.y*c.y + a1.x*a1.x + a1.y*a1.y -
             2 * (c.x * a1.x + c.y * a1.y) - r*r;
    var deter = b*b - 4*a*cc;

    if ( deter < 0 ) {
        //result = new Intersection("Outside");
    } else if ( deter == 0 ) {
        //result = new Intersection("Tangent");
        // NOTE: should calculate this point
    } else {
        var e  = Math.sqrt(deter);
        var u1 = ( -b + e ) / ( 2*a );
        var u2 = ( -b - e ) / ( 2*a );

        if ( (u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1) ) {
            if ( (u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1) ) {
                //result = new Intersection("Outside");
            } else {
                //result = new Intersection("Inside");
            }
        } else {

            if ( 0 <= u1 && u1 <= 1)
                result.push( a1.lrp(a2, u1) );

            if ( 0 <= u2 && u2 <= 1)
                result.push( a1.lrp(a2, u2) );
        }
    }

    return result;
};

// Intersecta rayos como la anterior pero con dos puntos y sus tangentes
Math.intersectRaysTn=function(p1,tn1,p2,tn2){
	return Math.intersectRays(p1,p1.add(tn1),p2,p2.add(tn2));
}
