import * as THREE from '../three'
var anchors = require('./anchors.js');
var DisplayObject = require('./DisplayObject.js');
var BitmapText = require('./BitmapText.js');
var Rectangle = require('./Rectangle.js');
var Sprite = require('./Sprite.js');
var Text = require('./Text.js');
var MvCvsSprite = require('./MvCvsSprite.js');

// All properties that when adjusted will force a redraw of the UI
var dirtyProperties = ['x','y','width','height','rotation','alpha','visible','pivot','anchor','smoothing','stretch','offset','text','scale','parent','textAlign','assetPath','color','left','right','up','down','ActiveInvoke'];
var DPR = window.devicePixelRatio;  
console.log("devicePixelRatio="+DPR);
var observeDirtyProperties = function(object, ui) {
	dirtyProperties.forEach(function(prop) {
		var proxyKey = '_proxied_' + prop;

		// Make sure initial values are set first
		object[proxyKey] = object[prop];

		Object.defineProperty(object, prop, {
			set: function(value) {
				if (object[prop] !== value) {
					ui.shouldReDraw = true;
				}

				object[proxyKey] = value;
			},

			get: function() {
				return object[proxyKey];
			},
		});
	});
};

/**
 * ThreeUI
 *
 * UI Class that renders an internal 2d canvas onto a plane
 *
 * @param {HTMLCanvasElement} gameCanvas
 * @param {int} height The pixel height of this UI -- Default: 720
  */

var ThreeUI = function(gameCanvas, height) {
	this.displayObjects = [];
	this.eventListeners = {
		click: [],
	};

	this.gameCanvas = gameCanvas;
	this.height = height || 720;
	var gameCanvasAspect = this.gameCanvas.width / this.gameCanvas.height;
	this.width = this.height * gameCanvasAspect;

	this.clearRect = null;
	this.shouldReDraw = true;
	this.prepareThreeJSScene();

	// Event listening
    canvas.addEventListener('touchstart', this.clickHandler.bind(this));
    // canvas.addEventListener('touchend', this.clickHandler.bind(this));
};

/**
 * Attach anchor types to ThreeUI
 */

ThreeUI.anchors = anchors;

ThreeUI.prototype = Object.assign( Object.create( THREE.EventDispatcher.prototype ), {constructor: ThreeUI})

/**
 * Internal method that does all preparations related to ThreeJS, creating the scene, camera, geometry etc.
 */
ThreeUI.prototype.prepareThreeJSScene = function() {
	this.camera = new THREE.OrthographicCamera(
		-this.width / 2,
		this.width / 2,
		this.height / 2,
		-this.height / 2,
		0, 30
	);
	this.scene = new THREE.Scene();

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width * DPR;
	this.canvas.height = this.height * DPR;
	this.context = this.canvas.getContext('2d');
	this.context.scale(DPR, DPR);
	this.texture = new THREE.Texture(this.canvas);
	var material = new THREE.MeshBasicMaterial({ map: this.texture , transparent : true});
	material.map.minFilter = THREE.LinearFilter;

	var planeGeo = new THREE.PlaneGeometry(this.width, this.height);
	this.plane = new THREE.Mesh(planeGeo, material);
	this.plane.matrixAutoUpdate = false;


	this.scene.add(this.plane);
};

/**
 * Draw the UI
 */

ThreeUI.prototype.draw = function() {
	if (!this.shouldReDraw) return;

	// Reset canvas
	if (this.clearRect) {
		this.context.clearRect(this.clearRect.x, this.clearRect.y, this.clearRect.width, this.clearRect.height);
	} else {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	var self = this;
	var length = this.displayObjects.length;
	for (var i = 0;i < length;i++) {
		this.displayObjects[i].render(self.context);
	}

	this.texture.needsUpdate = true;
	this.shouldReDraw = false;
};

/**
 * Render the UI with the provided renderer
 *
 * @param {THREE.WebGLRenderer} renderer
 */

ThreeUI.prototype.render = function(renderer) {
	this.draw();

	renderer.render(this.scene, this.camera);

	if (this.colorReplace) {
		this.context.save();

		this.context.fillStyle = this.colorReplace
		this.context.globalCompositeOperation = 'source-atop';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.restore();
	}
};

/**
 * Create a new Sprite
 *
 * @param {string} imagePath
 * @param {int} x
 * @param {int} y
 * @param {int} width
 * @param {int} height
 *
 * @return {Sprite}
 */

ThreeUI.prototype.createSprite = function(imagePath, x, y, width, height) {
	var displayObject = new Sprite(this, imagePath, x, y, width, height);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;
};

/**
 * Create a new Sprite from a sheet
 *
 * @param {string} imagePath
 * @param {string} sheetImagePath
 * @param {string} sheetDataPath
 * @param {int} x
 * @param {int} y
 * @param {int} width
 * @param {int} height
 *
 * @return {Sprite}
 */

ThreeUI.prototype.createSpriteFromSheet = function(imagePath, sheetImagePath, sheetDataPath, x, y, width, height) {
	var displayObject = new Sprite(this, imagePath, x, y, width, height, sheetImagePath, sheetDataPath);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;
};

/**
 * Create a new Rectangle
 *
 * @param {string} color
 * @param {int} x
 * @param {int} y
 * @param {int} width
 * @param {int} height
 *
 * @return {Rectangle}
 */

ThreeUI.prototype.createRectangle = function(x, y, width, height, color, colorStop) {
	var displayObject = new Rectangle(this, x, y, width, height, color, colorStop);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;
};

ThreeUI.prototype.createGroup = function(x, y, width, height) {
	var displayObject = new DisplayObject(this, x, y, width, height);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;	
}

ThreeUI.prototype.createMvCvsSprite = function(asset, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height) {
	var displayObject = new MvCvsSprite(this, asset, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;	
}
/**
 * Create a new Text
 *
 * @param {string} text
 * @param {string} font
 * @param {string} color
 * @param {int} x
 * @param {int} y
 *
 * @return {Text}
 */

ThreeUI.prototype.createText = function(text, size, font, color, x, y) {
	var displayObject = new Text(this, text, size, font, color, x, y);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;
};

/**
 * Create a new BitmapText
 *
 * @param {string} text
 * @param {string} font
 * @param {string} color
 * @param {int} x
 * @param {int} y
 *
 * @return {BitmapText}
 */

ThreeUI.prototype.createBitmapText = function(text, size, x, y, sheetImagePath, sheetDataPath) {
	var displayObject = new BitmapText(this, text, size, x, y, sheetImagePath, sheetDataPath);
	this.displayObjects.push(displayObject);
	observeDirtyProperties(displayObject, this);
	return displayObject;
};

/**
 * Add a new event listener, called by ThreeUI.DisplayObject
 * Shouldn't be used directly
 *
 * @param {string} type
 * @param {Function} callback This callback is called when the event is triggered, and is passed the DisplayObject as a first argument
 * @param {ThreeUI.DisplayObject} displayObject
 */

ThreeUI.prototype.UiAddEventListener = function(type, callback, displayObject) {
	this.eventListeners[type].push({
		callback: callback,
		displayObject: displayObject
	});
};

/**
 * Used internally to determine which registered click event listeners should be called upon click
 *
 * @param {MouseEvent} event
 */

ThreeUI.prototype.clickHandler = function(event) {

	// Hack to make sure we're not doing double events
	var coords = null;
	if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
		this.listeningToTouchEvents = true;

		if (event.touches.length > 0) {
			coords = { x: event.touches[0].pageX, y: event.touches[0].pageY };
		} else if (event.pageX && event.pageY) {
			coords = { x: event.pageX, y: event.pageY };
		} else {
			this.listeningToTouchEvents = false;
		}
	} else {
		// Mouse event
		coords = { x: event.pageX, y: event.pageY };
		console.log('coords'+coords)		
	}

	if (this.listeningToTouchEvents && event instanceof MouseEvent || coords === null) return;

	coords = this.windowToUISpace(coords.x, coords.y);

	var callbackQueue = [];
	this.eventListeners.click.forEach(function(listener) {
		var displayObject = listener.displayObject;
		if (!displayObject.shouldReceiveEvents()) return;

		var bounds = displayObject.getBounds();
		if (ThreeUI.isInBoundingBox(coords.x, coords.y, bounds.x, bounds.y, bounds.width, bounds.height)) {
			// Put listeners in a queue first, so state changes do not impact checking other click handlers
			callbackQueue.push(listener);
		}
	});

	callbackQueue.forEach(function(listener){
		listener.callback.bind(listener.displayObject)(); 
	});
};

/**
 * Helper method that converts a point to UI space from window space
 *
 * @param {int} x
 * @param {int} y
 *
 * @return {Object} x,y coordinates
 */

ThreeUI.prototype.windowToUISpace = function(x, y) {
	var bounds = this.gameCanvas.getBoundingClientRect();
	var scale = this.height / bounds.height;

	return {
		x: (x - bounds.left) * scale,
		y: (y - bounds.top) * scale,
	};
}

/**
 * Moves a ui element to the back of the displayobject queue
 * which causes it to render above other objects
 *
 * @param {ThreeUI.DisplayObject} displayObject
 */
ThreeUI.prototype.moveToFront = function(displayObject) {
	var elIdx = this.displayObjects.indexOf(displayObject);

	if (elIdx > -1) {
		this.displayObjects.splice(elIdx, 1);
	}

	this.displayObjects.push(displayObject);
};

/**
 * Helper method used to determine whether a point is inside of a given bounding box
 *
 * @param {int} x
 * @param {int} y
 * @param {int} boundX
 * @param {int} boundY
 * @param {int} boundWidth
 * @param {int} boundHeight
 *
 * @return {bool}
 */

ThreeUI.isInBoundingBox = function(x, y, boundX, boundY, boundWidth, boundHeight) {
	return (
		x >= boundX &&
		x <= boundX + boundWidth &&
		y >= boundY &&
		y <= boundY + boundHeight
	);
};

// Export ThreeUI as module
module.exports = ThreeUI;

// Expose ThreeUI to the window
// window.ThreeUI = ThreeUI;
