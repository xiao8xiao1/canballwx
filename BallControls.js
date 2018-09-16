import * as THREE from './libs/threejs/three'

var BallControls = function(camera, domElement, ballProcess) {
    var scope = this;
    scope.enabled = true;
    scope.arrBall = [];
    scope.arrTarget = []
    var clock = new THREE.Clock();
    var rect = domElement.getBoundingClientRect();
    var pointerVector = new THREE.Vector2();
    // var gplane;
    // Ball throwing mechanics
    var startTouchTime
    var endTouchTime
    var startTouch
    var endTouch

    var selectBall = null;
    var ray = new THREE.Raycaster();
    //wx.onTouchStart(onMouseDown)
    // wx.onTouchMove(onMouseMove)
    //wx.onTouchEnd(onMouseUp)
	domElement.addEventListener( 'touchstart', onMouseDown, false );
	domElement.addEventListener( 'touchend', onMouseUp, false );
    domElement.addEventListener( 'touchmove', onMouseMove, false );    
    domElement.addEventListener("mousedown", onMouseDown, false );
    domElement.addEventListener("mousemove", onMouseMove, false );
    domElement.addEventListener("mouseup", onMouseUp, false );


    // this.dispose = function () {
    //  window.removeEventListener( 'mousedown', onMouseDown, false );
    //  window.removeEventListener( 'mousemove', onMouseMove, false );
    //  window.removeEventListener( 'mouseup', onMouseUp, false );
    // };

    function onMouseDown(e){
        if ( scope.enabled === false ) return;       
        clock.getDelta();
        // Find mesh from a ray
        var pointer;
        if (e instanceof TouchEvent) 
            pointer = e.touches[0];
        else
            pointer = { clientX: e.pageX, clientY: e.pageY };

        var entity = intersectObjects(pointer.clientX, pointer.clientY, scope.arrBall)
        // var pos = entity.point;
        if(/*pos &&*/ entity){
            selectBall = entity.object
            ballProcess.selectBall(selectBall)
            // scope.dispatchEvent( { type: 'selectBall' } );
            // Set the movement plane
            // setScreenPerpCenter(pos,camera);
            // var idx = arrBall.indexOf(entity.object);
            // if(idx !== -1){
            // }
        }
    }
    function onMouseMove(e){
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        //event.stopPropagation();
        // Move and project on the plane
        // if (gplane) {
        //    var pos = projectOntoPlane(e.clientX,e.clientY,gplane,camera);
        //    if(pos){
        //    }
        // }
    }
    function onMouseUp(e) {
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        var delta = clock.getDelta();
        var pointer;
        if (e instanceof TouchEvent) 
            pointer = e.changedTouches[0];
        else
            pointer = { clientX: e.pageX, clientY: e.pageY };

        var entity = intersectObjects(pointer.clientX, pointer.clientY, scope.arrTarget)        
        if(entity){
            ballProcess.throwBall(selectBall, entity.point, delta)     
        }
        
        selectBall = null;
    }
    function intersectObjects( clientX, clientY, objects ) {
        var x = ( clientX - rect.left ) / rect.width;
        var y = ( clientY - rect.top ) / rect.height;
        pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
        ray.setFromCamera( pointerVector, camera );
        var intersections = ray.intersectObjects( objects, false );
        return intersections[ 0 ] ? intersections[ 0 ] : false;
    }

}

// BallControls.prototype = Object.assign( Object.create( THREE.EventDispatcher.prototype ), 
//                                                         {constructor: BallControls})


module.exports = BallControls;
