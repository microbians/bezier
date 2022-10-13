/********************************************************
	FPS Counter
	- microbians.com

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/

class FPS {
	constructor(elm) {
		if (elm) {
			this.domElm = document.getElementById(elm);
			this.domElm.id = elm;
		} else {
			this.domElm = document.createElement('DIV');
			this.domElm.id = `FPS[${FPS.UID++}]`; 						// unique ID
		}

		this.domElm.UID=FPS.UID;
		this.domElm.style.display="block";
		this.domElm.style.position="absolute";
		this.domElm.style.userSelect="none"; 									// Prevent user selection when dragging
		this.domElm.style.margin="0";
		this.domElm.style.padding="0";
		this.lastLoop = (new Date()).getMilliseconds();
		this.currLoop = (new Date()).getMilliseconds();
		this.fps=0;
		this.count=1;
	}
	update(){
		this.currLoop = (new Date()).getMilliseconds();
		if ( this.lastLoop > this.currLoop ) {
			this.fps = this.count;
			this.count = 1;
		} else {
			this.count++;
		}
		this.lastLoop = this.currLoop;
		this.domElm.innerHTML = this.fps;
	}
}
FPS.UID = 0;
