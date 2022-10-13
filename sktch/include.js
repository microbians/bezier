/********************************************************
	INCLUDE.js – microbians.com
	A tiny require

	@license Copyright (c) since 2020, Gabriel Suchowolski (microbians) / All Rights Reserved.
	Available via the MIT or new BSD license.
********************************************************/


// Little polyfill for currenscript;
if (!document.currentScript) {
	document.currentScript = function () {
		var scripts = document.querySelectorAll( 'script[src]' );
		var currentScript = {};
		currentScript.src = scripts[ scripts.length - 1 ].src;
		return currentScript
	}
}

include_js=[];
include_lib=[];

function include(js, mustLoaded, fn, domain){
	let include_jsToLoad = [];
	let lib = undefined;
	if (typeof js == 'array') {
		include_jsToLoad = include_jsToLoad.concat(js);
	} else if (typeof js == 'object') { // Must be lib and js form
		include_jsToLoad = include_jsToLoad.concat(js.js);
		lib = js.lib;
		include_lib[lib]=[].concat(js.js);
	} else { // Must be string
		include_jsToLoad.push(js);
	}
	for( let js of include_jsToLoad) {
		include_loader(js, mustLoaded, lib);
	}
}

function include_loader(js, mustLoaded, lib, fn, domain){
	let currentScriptLocation   = document.currentScript.src; 	// Path to the current js file
	let currentDocumentLocation = document.location; 		    // Path that load this script

	let currentDocumentFolder = currentDocumentLocation.toString().split('/').slice(0,-1).join('/');

	if (currentScriptLocation!='') {
		let currentScriptFolder   = currentScriptLocation.toString().split('/').slice(0,-1).join('/');

		let intersectStrings = currentScriptFolder.split('/').filter(function(value){
			return currentDocumentFolder.split('/').includes(value);
		}).join('/');

		let scriptPartialPath     = currentScriptFolder.replace(intersectStrings,'');
		let documentPartialPath   = currentDocumentFolder.replace(intersectStrings,'');

		if( scriptPartialPath[0] == '/' ) scriptPartialPath=scriptPartialPath.substring(1);

		var relativePath = Array(documentPartialPath.split('/').length).join('../')+scriptPartialPath+'/';
	} else {
		var relativePath='';
	}

	// Load the script
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = relativePath+js;
	if (js.toLowerCase().indexOf('.js')==-1) script.src+='.js';
	script.src+="?"+(new Date().getTime())
	script.async = false;
	script.loaded = false
	script.include_js = include_js;
	script.include_lib = include_lib;
	script.lib = lib;
	script.js=js;
	script.timeout = 7000;
	script.fn=fn;
	script.domain=domain;
	script.onload  = function(){
		this.loaded=true;
		this.include_js[this.js]=true;
		console.log('LOADED: '+ this.src);
		this.fn && this.fn.call(script.domain||window); // Call the function when is ready loaded on the domain or window (this)
	}
	script.onerror = function() {
  		script.timeout=0;
		throw "Error loading: "+this.js;
	};

	if (mustLoaded) {
		script.mustLoaded = mustLoaded;
		script.waitFn = function(){
			let fullLoaded=true;

			for(let js of this.mustLoaded) {
				if (this.include_lib[js]) { // Check if is a lib
					fullLoaded=false;
					this.mustLoaded=this.include_lib[js]; // If exist a lib interchange the array mustLoaded for the lib of js to be loaded
					break;
				}
				if (!this.include_js[js]) {
					fullLoaded=false;
					break;
				}
			}
			if (fullLoaded) {
				clearInterval(this.wait);
				console.log("All modules loaded for loading: "+script.js)
				document.head.appendChild(this);
			} else {
				if (new Date().getTime() > script.start+script.timeout) {
					clearInterval(this.wait);
					throw "Waiting timeout for all need modules [ "+ this.mustLoaded +" ] before loading: "+this.js;
				}
			}
		}
		script.start = new Date().getTime();
		console.log("Waiting modules for loading: "+script.js)
		script.wait = setInterval(function(){script.waitFn()}.bind(this),10);
	} else {
		document.head.appendChild(script);
	}
}

(function initInclude(){
	// Init taking the config attribute
	let include_config = document.currentScript.getAttribute('config');
	include_config && include(include_config);
}());
