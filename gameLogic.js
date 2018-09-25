// import * as THREE from './libs/threejs/three'

var GameLogic = function(c, scene, world, hp, levels, particle, arrTarget, arrBall, arrAttached, controls) {
  var winSound1 = new Audio('audio/crwin.mp3');
  var winSound2 = new Audio('audio/huawin.mp3');
  var colStaticSound = new Audio('audio/crwall.mp3');
  var colCanSound = new Audio('audio/crcan.mp3');

    var wall = null, ground = null 
    this.clearLevel = function (){
      if(ground){
        scene.remove(ground)
        world.remove(ground.body)
        ground.body = null; ground = null;
      }
  
      arrTarget.forEach(function(item){
        if (item){
          if (item.body){
            world.removeRigidBody(item.body)
            item.body = null;
          }
          scene.remove(item)
        }
      });  
      arrTarget.splice(0,arrTarget.length);
  
      arrBall.forEach(function(item){
        if (item){
          if (item.body){
            world.removeRigidBody(item.body)
            item.body = null;
          }
          scene.remove(item)
        }
      });  
      arrBall.splice(0,arrBall.length);
  
      flyingBalls.forEach(function(flyingBall, index) {
            flyingBalls.splice(index,1)
            world.removeRigidBody(flyingBall)
            scene.remove(flyingBall.mesh)
            flyingBall.mesh = null;
            flyingBall = null;
        })
  }
  
  this.initLevel = function (index){
      if (index === undefined){
        index = window.currentFileIndex;
      }
      this.clearLevel();  
      //ground
      ground = hp.addBox(c.roomWidth, 0.2,3*c.ballRad,  0,c.groundY -0.1 ,c.disdanceHalf);
  
      levels.go(index)
      clearInterval(checkfun);  checkfun = setInterval(checkResult1, 1000)
  }

  var flyingBalls = []
  var checkfun;
  var velocitySqLimit = (c.ballRad/world.timeStep); 
  var oldTimeStep = world.timeStep        
  var zero = new THREE.Vector3()
  this.selectBall = function (){
    controls.enabled = false;
  }

  this.throwBall = function (ball, to, delta, tDist){
    controls.enabled = true;
    particle.createTail(ball)
    var flyingBall = ball.body;
    if (!flyingBall)
      console.log('flyingBall err.', ball)
    to.sub(flyingBall.position).normalize()
    var temp = tDist/delta;
    console.log('tD tT  tv', tDist, delta, temp)
    to.multiplyScalar(temp*c.forceFactor)
    flyingBall.linearVelocity.copy(to)  //flyingBall.applyImpulse(this.zero, to);
  
  // var to = new THREE.Vector3();
  // to.set(0,c.shootHeight,-38)
  // to.normalize()
  // to.multiplyScalar(c.forceFactor)
  // flyingBall.linearVelocity.copy(to)
    if (Math.abs(flyingBall.linearVelocity.z) >= velocitySqLimit) {
        var dist2NearestZ = ball.body.position.z - levels.nearestZ ;
        var distOneSteps = world.timeStep*(-ball.body.linearVelocity.z);
        var distModLeft = dist2NearestZ % distOneSteps;
        flyingBall.changeStepAtPosZ = ball.body.position.z - (dist2NearestZ - distModLeft) + 0.01
        flyingBall.newTimeStep = c.ballRad/(-ball.body.linearVelocity.z)
  
        console.log('change at:',flyingBall.changeStepAtPosZ, 'v',flyingBall.linearVelocity.z, 'vLmt', velocitySqLimit)
    }
    flyingBalls.push(flyingBall)
    var index = arrBall.indexOf(flyingBall.mesh)
    arrBall.splice(index, 1)
    ball.body.onCollide = function(bodyOther, pos){
        if (bodyOther !== ground.body){
            if (bodyOther.isDynamic)
              colCanSound.play();
            else
              colStaticSound.play();
  
            particle.createExplosion(pos)
        }
        
        var index = arrAttached.indexOf(bodyOther)
        if (index != -1){
          bodyOther.isKinematic = false;
          bodyOther.attachTo = null;
          bodyOther.attachToPos = null;
          arrAttached.splice(index, 1)  
        }
    }
  }

  this.flyingCheck = function (){
    var minTimeStep = oldTimeStep;
    flyingBalls.forEach(function(flyingBall, index) {
        var p = flyingBall.position;
        if (p.y < 0|| p.x < -c.roomWidth || p.x > c.roomWidth){
            flyingBalls.splice(index,1)
            world.removeRigidBody(flyingBall)
            scene.remove(flyingBall.mesh)
            flyingBall.mesh = null;
            flyingBall = null;
            return;
        }
        // console.log('v', flyingBall.linearVelocity.z, 'p', flyingBall.position)
        if (Math.abs(flyingBall.linearVelocity.z) < velocitySqLimit)
            return;
  
        if (flyingBall.position.z < flyingBall.changeStepAtPosZ && flyingBall.position.z > -c.disdanceHalf)
        {
            if (flyingBall.newTimeStep < minTimeStep)
                minTimeStep = flyingBall.newTimeStep;
        }
    })
    if (oldTimeStep !== world.timeStep) {
      console.log(world.timeStep)
    }
  
    
    if (minTimeStep !== world.timeStep) {
        console.log('setTimeStep', minTimeStep)
        world.setTimeStep(minTimeStep);
    }
    arrTarget.forEach(function(item, index) {
        var p = item.position;
        if (p.y < 0|| p.x < -c.roomWidth || p.x > c.roomWidth){
            if (item.body){
                world.removeRigidBody(item.body)
                item.body = null;
            }
            scene.remove(item)
            arrTarget.splice(index,1)
            levels.nTarget--;
        }
    });

    arrAttached.forEach(function(item) {
      item.position.addVectors(item.attachTo.position, item.attachToPos)
    })
  }
  
  function checkResult1(){
    if (levels.nTarget <= 0){
        console.log('succeed')
        if (window.currentFileIndex % 2 === 1) 
          winSound1.play();
        else
          winSound2.play();
        window.showPassLevel();  
        return;
    }
    if (arrBall.length === 0){
        if (flyingBalls.length === 0){
            setTimeout(checkResult2, 2000)
        }else{
            setTimeout(checkResult2, 4000)
        }
        clearInterval(checkfun);  checkfun = null;
    }
  }
  function checkResult2(){
    if (levels.nTarget <= 0){
        console.log('succeed')
  
        if (window.currentFileIndex % 2 === 1) 
          winSound1.play();
        else
          winSound2.play();
  
        window.showPassLevel();  
    }
    else{
        console.log('failed')
        window.showPassLevel();  
    }
  }  
}

module.exports = GameLogic