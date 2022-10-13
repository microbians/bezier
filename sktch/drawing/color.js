/********************************************************
	COLOR – microbians.com
	Color clases

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

// EN PROCESO!!

class Color {
	constructor() {
		this.r=0;
		this.g=0;
		this.b=0;
		this.a=0;
	}
	hex2RGB(hexValue) {
		var tmp = new Object();
		tmp.r = Math.floor(hexValue / (Color.RGBMAX * Color.RGBMAX));
		tmp.g = Math.floor((hexValue / Color.RGBMAX) % Color.RGBMAX);
		tmp.b = Math.floor(hexValue % Color.RGBMAX);
		return tmp;
	}
	RGB2hex(a,b,c) {
		if (a<0) a=0;
		if (b<0) b=0;
		if (c<0) c=0;
		if (a>aCOLOR.RGBMAX) a=aCOLOR.RGBMAX;
		if (b>aCOLOR.RGBMAX) b=aCOLOR.RGBMAX;
		if (c>aCOLOR.RGBMAX) c=aCOLOR.RGBMAX;
		a = Number(a).toString(16).toUpperCase();
		if (a.length < 2) a = '0' + a;
		else if (a.length > 2) a = 'FF';
		b = Number(b).toString(16).toUpperCase();
		if (b.length < 2) b = '0' + b;
		else if (b.length > 2) b = 'FF';
		c = Number(c).toString(16).toUpperCase();
		if (c.length < 2) c = '0' + c;
		else if (c.length > 2) c = 'FF';
		return Number('0x' + a + b + c);
	}
	hsv2rgb(hue, sat, val) {
		var red, grn, blu, i, f, p, q, t;
		hue%=360;
		if(val==0) {return({r:0, g:0, v:0});}
		sat/=100;
		val/=100;
		hue/=60;
		i = Math.floor(hue);
		f = hue-i;
		p = val*(1-sat);
		q = val*(1-(sat*f));
		t = val*(1-(sat*(1-f)));
		if (i==0) {red=val; grn=t; blu=p;}
		else if (i==1) {red=q; grn=val; blu=p;}
		else if (i==2) {red=p; grn=val; blu=t;}
		else if (i==3) {red=p; grn=q; blu=val;}
		else if (i==4) {red=t; grn=p; blu=val;}
		else if (i==5) {red=val; grn=p; blu=q;}
		red = Math.floor(red*255);
		grn = Math.floor(grn*255);
		blu = Math.floor(blu*255);
		return this.RGB2hex(red, grn, blu);
	}
	rgb2hsv(red, grn, blu) {
		var x, val, f, i, hue, sat, val;
		red/=255;
		grn/=255;
		blu/=255;
		x = Math.min(Math.min(red, grn), blu);
		val = Math.max(Math.max(red, grn), blu);
		if (x==val){
			return({h:undefined, s:0, v:val*100});
		}
		f = (red == x) ? grn-blu : ((grn == x) ? blu-red : red-grn);
		i = (red == x) ? 3 : ((grn == x) ? 5 : 1);
		hue = Math.floor((i-f/(val-x))*60)%360;
		sat = Math.floor(((val-x)/val)*100);
		val = Math.floor(val*100);
		return({h:hue, s:sat, v:val});
	}
}
Color.RGBMAX = 256;
