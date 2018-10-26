// import * as THREE from './libs/threejs/three'

var BallControls = function(scene, camera, domElement, gl, arrTarget, arrBall) {
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
    var mov2 = new THREE.Vector2();
    var planeGeometry = new THREE.PlaneBufferGeometry(window.innerWidth*2 , window.innerHeight, 2, 2);
    var planeMaterial = new THREE.MeshBasicMaterial({ visible: false, color: 0x808000, transparent :true, opacity :0.5 });
    var planeXY = new THREE.Mesh(planeGeometry, planeMaterial); scene.add(planeXY);
    scene.add(planeXY)
    wx.onTouchStart(onMouseDown)
    wx.onTouchMove(onMouseMove)
    wx.onTouchEnd(onMouseUp)
	// domElement.addEventListener( 'touchstart', onMouseDown, false );
	// domElement.addEventListener( 'touchend', onMouseUp, false );
    // domElement.addEventListener( 'touchmove', onMouseMove, false );
    // domElement.addEventListener("mousedown", onMouseDown, false );
    // domElement.addEventListener("mousemove", onMouseMove, false );
    // domElement.addEventListener("mouseup", onMouseUp, false );
    // this.dispose = function () {
    //  window.removeEventListener( 'mousedown', onMouseDown, false );
    //  window.removeEventListener( 'mousemove', onMouseMove, false );
    //  window.removeEventListener( 'mouseup', onMouseUp, false );
    // };
    var clickOffsetX = 0;
    var isMovUp = false;
    function onMouseDown(e){
        if ( scope.enabled === false ) return;       
        var pointer = e.changedTouches ? e.changedTouches[0] : e;
        startPointer.x = pointer.clientX;
        startPointer.y = pointer.clientY;

        var entity = intersectObjects(startPointer.x, startPointer.y, arrBall)

        if(entity){
            selectBall = entity.object
            gl.selectBall(selectBall)
            planeXY.position.copy(selectBall.position)
            clickOffsetX = entity.point.x - selectBall.position.x;

            isMovUp = false;
        } else
            selectBall = null;
    }
    function onMouseMove(e){
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        var pointer = e.changedTouches ? e.changedTouches[0] : e;

        mov2.x = pointer.clientX - startPointer.x;
        mov2.y = startPointer.y - pointer.clientY;
       
        var entity = intersectObjects(pointer.clientX, pointer.clientY, [planeXY])
        if(entity)
        {
            console.log(entity.point)
            // console.log
            if (entity.point.y < selectBall.position.y + selectBall.scale.y 
                && Math.abs(mov2.x) > 0.2 && mov2.y*5 < Math.abs(mov2.x)){
                if (selectBall.body)
                    selectBall.body.setPosition( {x:entity.point.x - clickOffsetX, y:selectBall.body.position.y, z:selectBall.body.position.z});
                isMovUp = false;
            }else{
                if (!isMovUp){
                    isMovUp = true;
                    clock.getDelta();
                }
            }
        }
    }
    function onMouseUp(e) {
        if ( scope.enabled === false ) return;
        if (!selectBall) return;
        if (!isMovUp) {
            selectBall = null;
            return;
        }
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
