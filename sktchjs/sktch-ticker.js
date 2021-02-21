/************************************************
	TICKER.js – microbians.com
	Create a ticker that works on desired FPS
*************************************************/

// Helper
window.requestAnimFrame = 	window.requestAnimationFrame       ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame    ||
							window.ieRequestAnimationFrame     ||
							function( callback ){
								window.setTimeout(callback, 1000 / 60);
							};
