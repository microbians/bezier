/********************************************************
	MATH.js – microbians.com
	Math extensions + Bezier extensions
********************************************************/
 
// Global isNum -> Double check is number
IsNum=function(n) {
		if (((Number(typeof n)).toString()== "NaN")&&((Number(n+"")).toString()== "NaN")) return false
		else return true
}

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
