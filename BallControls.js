// import * as THREE from './libs/threejs/three'

var BallControls = function(camera, domElement, gl, arrTarget, arrBall) {
    var scope = this;
    scope.enabled = true;
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
    var startPointer = new THREE.Vector2();
    var endPointer = new THREE.Vector2();

    // wx.onTouchStart(onMouseDown)
    // wx.onTouchMove(onMouseMove)
    // wx.onTouchEnd(onMouseUp)
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
        var pointer = e.changedTouches ? e.changedTouches[0] : e;
        startPointer.x = pointer.clientX;
        startPointer.y = pointer.clientY;
            
        var entity = intersectObjects(startPointer.x, startPointer.y, arrBall)
        // var pos = entity.point;
        if(/*pos &&*/ entity){
            selectBall = entity.object
            gl.selectBall(selectBall)
            // scope.dispatchEvent( { type: 'selectBall' } );
            // Set the movement plane
            // setScreenPerpCenter(pos,camera);
            // var idx = arrBall.indexOf(entity.object);
            // if(idx !== -1){
            // }
        }
        // e.preventDefault();
        // e.stopPropagation();        
    }
    function onMouseMove(e){
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        // Move and project on the plane
        // if (gplane) {
        //    var pos = projectOntoPlane(e.clientX,e.clientY,gplane,camera);
        //    if(pos){
        //    }
        // }
        // e.preventDefault();
        // e.stopPropagation();
    }
    function onMouseUp(e) {
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        var delta = clock.getDelta();
        var pointer = e.changedTouches ? e.changedTouches[0] : e;
        endPointer.x = pointer.clientX;
        endPointer.y = pointer.clientY;               
        var entity = intersectObjects(endPointer.x, endPointer.y, arrTarget)
        if(entity)
        {
            gl.throwBall(selectBall, entity.point, delta, endPointer.sub(startPointer).length())
        }
        
        selectBall = null;
        // e.preventDefault();
        // e.stopPropagation();
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

module.exports = BallControls;
