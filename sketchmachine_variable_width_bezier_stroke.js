var layer,layerStroke;

var layerNum=0;

var np;
var op;

var p1;
var pc;
var p2;

var stroke=[];

var brushQuill = {
	min:1,
	max:30,
	acc:10,
	limiter: 2000,
	friction: 1.1
};

var dirtyQuill = {
	min:4,
	max:20,
	acc:2,
	drops:2000,
	dropsFrecuency: 100,
	dropsSmooth: 400,
	limiter: 120,
	friction: 0.2
};

var brushPen = {
	min:0,
	max:3,
	acc:4,
	limiter: 2000,
	friction: 1.2
};

var brush = brushQuill;

var d=0;
var acc=0;

var drops=1; // Drops level
var flow=1;  // Stroke flow (efecto de presion mediante la aceleración)

var strokes = [];
var draw=false;
var shiftKey=false;
var controlKey=false;

window.mouse={x:0,y:0};

ACCURATE=120;
ACCURATEcurr=0;

function keyPressed(event) {
	if (event.shiftKey) 	shiftKey=true; 		else 	shiftKey=false;
	if (event.ctrlKey) 		controlKey=true;	else 	controlKey=false;
}
window.addEventListener('keydown',keyPressed,false);
window.addEventListener('keyup'  ,keyPressed,false);

function init() {
	stage = new Layer({	x:0, y:0, w:window.innerWidth, h:window.innerHeight, debug:false });
	stage.appendTo( document.body );

	layerStroke  = new Layer({ id:"STROKE",x:0,	y:0, w:window.innerWidth, h:window.innerHeight,	debug:false	});

	layerStroke.appendTo( document.body );

	layerStroke.domElm.style.opacity=1;


/*
	let filterid="pen";
	layerStroke.domElm.style.filter=`url(#${filterid})`;
	stage.domElm.style.filter=`url(#${filterid})`;
*/

	let tickFPS = new FPS('fps');
	updateMouseEvent = function() {
		window.mouse = new Vector( event.clientX - stage.x/stage.RETINA, event.clientY - stage.y/stage.RETINA);
		if (draw) {
			drawing();
		}
		tickFPS.update();
	}

	window.addEventListener("mousedown", 	startDraw);
	window.addEventListener("mouseup", 		stopDraw);
	window.addEventListener("mousemove", 	updateMouseEvent);
}

function startDraw(event) {
	updateMouseEvent(event);

	stroke = []; // 0
	d=brush.min;
	acc=brush.acc;

	drawing();
	draw=true;
}

function drawing(last) {

	var newPos = new Vector( window.mouse.x, window.mouse.y );

	if (!last) {
		/*
		// Controla el tiempo entre trazos para no crear más de los necesarios
		var curTime=new Date().getTime();
		if ( curTime < ACCURATEcurr+1000/ACCURATE ) 	{
			return;
		} else ACCURATEcurr=curTime;
		*/
		if ( stroke.last() && Math.distance(stroke.last().p, newPos)<3 ) {
			return;  // Don't draw if not movement
		}
	}

	stroke.push({
		p: newPos,
		d: d
	});// 1 ... n

	if(stroke.length<3) {
		return;
	}

	stroke.last().p = stroke.prior().p.lrp( stroke.last().p,.4); // Smooth positions

	if (last) { // last Stroke

		var p1 = stroke.in(-2).p.med( stroke.prior().p );
		var pc = stroke.prior().p;
		var p2 = stroke.last().p;

	} else if (stroke.length==3) { // first stroke can be drawn

		var p1 = stroke.in(-2).p;
		var pc = stroke[1].p;
		var p2 = stroke[1].p.med( stroke[2].p );

	} else {

		var p1 = stroke.in(-2).p.med( stroke.prior().p );
		var pc = stroke.prior().p;
		var p2 = stroke.last().p.med( stroke.prior().p );

	}
	var np = stroke.last().p;

	// DIRTY TRICKS - To solve the union betwen each trace
	p1=p1.sub( p1.vec(pc).uni().mul(.1) );
	//p2=p2.add( pc.vec(p2).uni().mul(.1) );

	var strokeDistance = Math.distance2(p1,pc)+Math.distance2(pc,p2);

	acc += strokeDistance / brush.limiter;
	acc = acc / brush.friction;

	d = Math.lerp( brush.min, brush.max, 1/acc);
	d = Math.lerp( stroke.prior().d, d, .1);

	d = Math.clamp(d, brush.min, brush.max);

	if(brush.drops) {
		if (Math.random(0,100)<brush.dropsFrecuency) {
			d = Math.lerp( d, Math.random(brush.min,brush.drops), 1/brush.dropsSmooth);
		}
	}


//dirty
//	d= Math.random(brush.min, brush.max);
//	d=Math.lerp( stroke.prior().d, d, .2);


	stroke.last().d = d;

	layerStroke.strokeStyle=undefined;
	layerStroke.lineWidth=undefined;
	layerStroke.fillStyle="black";
	//layerStroke.globalAlpha=.2

	var b  = new QuadBezier(p1,pc,p2);

	var t  = b.closestTtoPc();
	var pt = b.getPointAtT(t);

	var strokeWeight = stroke.prior().d;
	var p1n = b.normalUnitVectorAtT(0);
	var p1L = p1.add( p1n.mul(+strokeWeight/2) );
	var p1R = p1.add( p1n.mul(-strokeWeight/2) );

	var strokeWeight = Math.lerp(stroke.prior().d, stroke.last().d, t);
	var ptn = b.normalUnitVectorAtT(t);
	var ptL = pt.add( ptn.mul(+strokeWeight/2) );
	var ptR = pt.add( ptn.mul(-strokeWeight/2) );

	var strokeWeight = stroke.last().d;
	var p2n = b.normalUnitVectorAtT(1);
	var p2L = p2.add( p2n.mul(+strokeWeight/2) );
	var p2R = p2.add( p2n.mul(-strokeWeight/2) );

	// Cap
	if (last) {
		layerStroke.beginPath();
		let angStart= new Vector(1,0).ang(p2R.vec(p2L));
		layerStroke.arc(p2.sub(pc.vec(p2).uni().mul(.1)), stroke.last().d/2 , angStart, angStart+Math.PI);
		layerStroke.fill();
	} else if (stroke.length==3) {
		layerStroke.beginPath();
		let angStart= new Vector(1,0).ang(p1L.vec(p1R));
		layerStroke.arc(p1.add(p1.vec(pc).uni().mul(.1)), stroke.first().d/2 , angStart, angStart+Math.PI);
		layerStroke.fill();
	}

	if (b.angle<Math.PI/4) { // IF the angle is closed

		var p1c  = b.getControlPointOfASegment(0,t);
		var b1   = new QuadBezier(p1,p1c,pt);
		var p1m  = p1n.add(ptn);
		var p1t  = Math.lerp( 0,t, b1.closestTtoPc() ); // Interpolate over 0-t (original bezier b) the t of p1 p1c pt
		var strokeWeight = Math.lerp(stroke.prior().d, stroke.last().d, p1t); // Use that t to know the weight on that point
		var p1cL = p1c.add( p1m.mul( +strokeWeight/p1m.length2() ) ); // Expand with that strokeWeight the bezier stroke
		var p1cR = p1c.add( p1m.mul( -strokeWeight/p1m.length2() ) );

		var p2c  = b.getControlPointOfASegment(t,1);
		var b2   = new QuadBezier(pt,p2c,p2);
		var p2m  = ptn.add(p2n);
		var p2t  = Math.lerp( t,1, b2.closestTtoPc() );
		var strokeWeight = Math.lerp(stroke.prior().d, stroke.last().d, p2t);
		var p2cL = p2c.add( p2m.mul( +strokeWeight/p2m.length2() ) );
		var p2cR = p2c.add( p2m.mul( -strokeWeight/p2m.length2() ) );

		// DIRTY TRICKS - To solve the union betwen each trace
		ptLfix=ptL.add( ptL.vec(ptR).per().uni().mul(.1) );
		ptRfix=ptR.add( ptL.vec(ptR).per().uni().mul(.1) );

		layerStroke.beginPath();
		layerStroke.moveTo(p1L);
		layerStroke.quadraticCurveTo(p1cL, ptLfix);
		layerStroke.lineTo(ptRfix);
		layerStroke.quadraticCurveTo(p1cR, p1R);
		layerStroke.fill();

		layerStroke.beginPath();
		layerStroke.moveTo(p2L);
		layerStroke.quadraticCurveTo(p2cL, ptL);
		layerStroke.lineTo(ptR);
		layerStroke.quadraticCurveTo(p2cR, p2R);
		layerStroke.fill();

	} else {
		ptm  = p1n.add(p2n);
		var strokeWeight = Math.lerp(stroke.prior().d, stroke.last().d, t);
		ptcL = pc.add( ptm.mul( +strokeWeight/ptm.length2() ) );
		ptcR = pc.add( ptm.mul( -strokeWeight/ptm.length2() ) );

		layerStroke.beginPath();
		layerStroke.moveTo(p1L);
		layerStroke.quadraticCurveTo(ptcL, p2L);
		layerStroke.lineTo(p2R);
		layerStroke.quadraticCurveTo(ptcR, p1R);
		layerStroke.fill();
	}

}

function stopDraw(event) {

	updateMouseEvent(event);
	draw=false;

	d=brush.min;
	acc=brush.acc;
	drawing(true); //Last

	stage.globalAlpha = layerStroke.domElm.style.opacity;
	stage.copy(layerStroke);
	stage.globalAlpha = 1;
	stage.globalCompositeOperation = "source-over";
	layerStroke.clear();

}

window.ready(init);
