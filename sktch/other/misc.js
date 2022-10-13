/********************************************************
	MISC.js – microbians.com
	Misc functions

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

// Old fashion Flash
// Simple console.log();
log   = console.log;
trace = console.log;

// Some helper function to take the positon of DOM elements in the body
//
Object.defineProperty( Element.prototype, 'documentOffsetTop', {
	get: function () {
		return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
	}
} );
Object.defineProperty( Element.prototype, 'documentOffsetLeft', {
	get: function () {
		return this.offsetLeft + ( this.offsetParent ? this.offsetParent.documentOffsetLeft : 0 );
	}
} );

// Simple ready function
window.ready = function(fn){ (document && document.readyState && document.readyState!=="loading" && document.body) ? fn.call() : setTimeout(window.ready,10, fn); };


// Array shit
Array.prototype.min = function() {
  return this.reduce((m, p) => p < m ? p : m, this[0]);
}
Array.prototype.max = function() {
  return this.reduce((m, p) => p > m ? p : m, this[0]);
}
Array.prototype.last  = function ()  {  return this[this.length-1]; };
Array.prototype.prior = function ()  {  return this.in(-1); };
Array.prototype.first = function ()  {  return this[0]; };
Array.prototype.in    = function (n) {  return n>=+0 ? this[n] : this[this.length-1+n]; };

Array.prototype.insertAt = function(index, item) { this.splice(index,0,item); }
Array.prototype.deleteAt = function(index)		 { this.splice(index,1);	  }



//HOW TO USE IT
// console.log( Array.last.call([1,2,3,4,5,6,5,4,3,2,1]) );


// Helper
window.requestAnimFrame = 	window.requestAnimationFrame       ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame    || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
							window.oRequestAnimationFrame 	   ||
							window.ieRequestAnimationFrame     ||
							window.msRequestAnimationFrame     ||
							function( callback ){
								window.setTimeout(callback, 1000 / 60);
							};

// Assumes h, s, and l are contained in the set [0, 1] and
// returns r, g, and b in the set [0, 255].
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

function swap(x,y){
  var t=x;
  x=y;
  y=t;
}
