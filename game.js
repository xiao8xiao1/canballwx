import './libs/weapp-adapter/index'
import './libs/symbol'
import * as THREE from './libs/threejs/three'
import './libs/threejs/controls/OrbitControls'
import * as OIMO from './libs/threejs/oimo'
// import CanBallLevels from 'canBallLevels'
var CanBallLevels = require('canBallLevels');

// import TWEEN from './libs/threejs/tween.min'
// var InitMouseMov = require('mouseMov.js');
var TWEEN = require('./libs/threejs/Tween')
var AssetLoader = require('./libs/threejs/threeUi/AssetLoader');
var ThreeUI = require('./libs/threejs/threeUi/ThreeUI.js');
var PlaceUi = require('ui.js');
var OimoHelper = require('./libs/threejs/oimoHelper');
var BallControls = require('BallControls.js');
var Particle = require('Particle.js');

window.levelDirs = ['帮助','水瓶座','双鱼座','白羊座','金牛座','双子座','巨蟹座','狮子座','处女座 ','天秤座','天蝎座','射手座','魔羯座']
window.DirDiff = [0,0,1,0,1,1,2,2,2,3,3,3,3]

AssetLoader.add.image('images/fenxiang.png');
AssetLoader.add.image('images/paihang.png');
AssetLoader.add.image('images/message.png');
AssetLoader.add.image('images/mute_off.png');
AssetLoader.add.image('images/mute_on.png');
AssetLoader.add.image('images/suc.png');
AssetLoader.add.image('images/return.png');
AssetLoader.add.image('images/levels.png');
AssetLoader.add.image('images/scroll_r.png');
AssetLoader.add.image('images/star-on.png');
AssetLoader.add.image('images/left.png');
AssetLoader.add.image('images/up.png');
AssetLoader.load(main);



window.currentDirIndex = 0;
window.currentFileIndex = 0;
var globleDef_string ;
var globleDef ;
var groupsDef ;

// var flySound = new Audio('audio/collision.mp3');
var winSound1 = new Audio('audio/crwin.mp3');
var winSound2 = new Audio('audio/huawin.mp3');
var colStaticSound = new Audio('audio/crwall.mp3');
var colCanSound = new Audio('audio/crcan.mp3');

wx.showShareMenu()
wx.onShareAppMessage(function () {
  console.log('shared')
  // 用户点击了“转发”按钮
  return {
    title: '转发标题'
  }
})  

function main(){

  [window.currentDirIndex, window.currentFileIndex] = getDirLevel();
  initThree();
  InitUi()
  animate();
}

var ui;
function InitUi(){
  ui = new ThreeUI(renderer.domElement, window.innerHeight, true);  

  var placeUi = new PlaceUi(ui);
  ui.addEventListener ('start', function(e) {
    initLevel();
  });
  // ui.addEventListener ('home', removeCubes);  
  ui.addEventListener ('selectDirFile', function(e){
    window.currentDirIndex = e.dirIndex;  window.currentFileIndex = e.fileIndex;
    setDirLevel(window.currentDirIndex, window.currentFileIndex)
    initLevel();
  });
  
  ui.addEventListener ('thisAgain', function(e){
    initLevel();
  });  

  ui.addEventListener ('playBack', function(e){

  });  

  ui.addEventListener ('next', function(e){
    passDirLevel()
    initLevel();
  });  
}

var fs = wx.getFileSystemManager();
function getDirLevel(){
  var dirIndex = 0, levelIndex = 0;
  try
  {
    var DirLevel = fs.readFileSync(`${wx.env.USER_DATA_PATH}/level.txt`,"ascii").split(',')
    var dirIndex = Number(DirLevel[0]);  var levelIndex = Number(DirLevel[1]);
  }
  catch(errMsg)
  {
    console.log(errMsg)
  }
  return [dirIndex, levelIndex];
}

function setDirLevel(dirIndex, fileIndex){
  var text = ''+dirIndex+','+fileIndex
  try
  {
    fs.writeFileSync(`${wx.env.USER_DATA_PATH}/level.txt`,text,"ascii")
  }
  catch(errMsg)
  {
    console.log(errMsg)
  }
}

function passDirLevel(){
  // var files = fs.readFileSync('levels/'+window.levelDirs[window.currentDirIndex]+'/dir.txt', "ascii").split("\r\n");
  // files.length -= 1;
  // console.log(files)
  // if (window.currentFileIndex + 1 < files.length)
  //   window.currentFileIndex++
  // else if (window.currentDirIndex + 1 < window.levelDirs.length){
  //   window.currentDirIndex++;
  //   window.currentFileIndex = 0;
  // }
  // else{
  //   console.log('pass all levels')
  //   window.currentDirIndex = 0
  //   window.currentFileIndex = 0
  // }
  window.currentFileIndex++;
  if (window.currentFileIndex > levels.getCnt())
    window.currentFileIndex = 0;
  
  setDirLevel(window.currentDirIndex, window.currentFileIndex)
}

//html
var c = new function () {
  this.gravity = 20
  this.cameraY = 15
  this.cameraZ = 30
  this.LookatY = 15
  this.LookatZ = 0
  this.zoom = 1
  this.disdanceHalf = 15
  this.forceFactor = 0.1
  this.groundY = 9
  this.roomWidth = 30
  this.deskHight = 10
  this.ballRad = 1
  this.canRad = 1.2
  this.canHeight = 4
  this.massBall = 5
  this.massCan = 10
  this.shootHeight = 4
  this.level = 0
};
var camera, scene, renderer, particle, ballControls, hp, world, levels;
var velocitySqLimit,oldTimeStep
var controls = {}
function initThree() {
  var W = window.innerWidth, H = window.innerHeight;
  console.log(window.innerHeight)
  // scene
  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );
  scene.background = new THREE.Color(0xc2ebce);
  // camera
  camera = new THREE.PerspectiveCamera( 45, W / H, 1, 1000 );
  camera.position.set(0, c.cameraY, c.cameraZ);
  camera.up.set(0,1,0);
  camera.lookAt(new THREE.Vector3(0,c.LookatY,c.LookatZ));
  camera.zoom = c.zoom
  scene.add(camera);

  // lights
  scene.add( new THREE.AmbientLight( 0x111111 ) );
  var light = new THREE.DirectionalLight( 0xffffff, 1.75 );
  var d = 20;
  light.position.set( 40, 20, 30 );
  scene.add( light );
  renderer = new THREE.WebGLRenderer( {canvas: canvas, alpha :true, antialias: true, precision: "mediump" } );
  renderer.setSize( W, H );
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setClearColor( scene.fog.color );
  renderer.autoClear = false; // To allow render overlay on top of sprited sphere
  var axesHelper = new THREE.AxesHelper( 5 );  scene.add( axesHelper );
  // var container = document.createElement( 'div' );  document.body.appendChild( container );  container.appendChild( renderer.domElement );

  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.target.set (0, 5, 0)
  // controls.update();
  particle = new Particle();    scene.add(particle.initParticles());
  ballControls = new BallControls(camera, renderer.domElement, ballProcess);
  // physics = new CannonHelper(0,-c.gravity,0, 1/60);  world=physics.world;
  world = new OIMO.World({gravity: [0,-c.gravity,0], random:false, iterations:24})
  hp = new OimoHelper(world, scene);
  levels = new CanBallLevels(c, hp, ballControls, world)
  velocitySqLimit = (c.ballRad/world.timeStep); 
  oldTimeStep = world.timeStep    
}
var lastTime;var i;
function animate(time) {
  TWEEN.update();
  requestAnimationFrame( animate );

  // if(time && lastTime){
  //     var dt = (time - lastTime)/1000;
  //     // for (i = 0; i < 10; ++i)
  //         physics.update(dt, 5);
  //     particle.tick(dt)
  // }
  world.step();
  flyingCheck();

  renderer.clear();
  renderer.render( scene, camera );
  ui.render(renderer);    
  lastTime = time;
}


var wall = null, ground = null 
function clearLevel(){
if(ground){
  scene.remove(ground)
  world.remove(ground.body)
  ground.body = null; ground = null;
}

ballControls.arrTarget.forEach(function(item){
  if (item){
    if (item.body){
      world.removeRigidBody(item.body)
      item.body = null;
    }
    scene.remove(item)
  }
});  
ballControls.arrTarget.splice(0,ballControls.arrTarget.length);

ballControls.arrBall.forEach(function(item){
  if (item){
    if (item.body){
      world.removeRigidBody(item.body)
      item.body = null;
    }
    scene.remove(item)
  }
});  
ballControls.arrBall.splice(0,ballControls.arrBall.length);

flyingBalls.forEach(function(flyingBall, index) {
      flyingBalls.splice(index,1)
      world.removeRigidBody(flyingBall)
      scene.remove(flyingBall.mesh)
      flyingBall.mesh = null;
      flyingBall = null;
  })
}

function initLevel(index){
  if (index === undefined){
    index = window.currentFileIndex;
  }
  clearLevel();  
  //far plane
  wall = hp.addBox(c.roomWidth*2, 80,4*c.canRad,   0,0,-c.disdanceHalf-2*c.canHeight, {restitution:0.005});
  ballControls.arrTarget.push(wall);
  //ground
  ground = hp.addBox(c.roomWidth, 0.2,3*c.ballRad,  0,c.groundY -0.1 ,c.disdanceHalf);

  levels.go(index)
  clearInterval(checkfun);  checkfun = setInterval(checkResult1, 1000)
}
var flyingBalls = []
var velocitySqLimit, oldTimeStep, checkfun;
var ballProcess = {
zero : new THREE.Vector3(),
selectBall : function (){
  controls.enabled = false;
},
throwBall : function (ball, to, delta, tDist){
  controls.enabled = true;
  var flyingBall = ball.body;
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
  var index = ballControls.arrBall.indexOf(flyingBall.mesh)
  ballControls.arrBall.splice(index, 1)
  ball.body.onCollide = function(bodyOther, pos){
      if (bodyOther !== ground.body){
          if (bodyOther.isDynamic)
            colCanSound.play();
          else
            colStaticSound.play();

          particle.createExplosion(pos)
      }
  }
}
}
function flyingCheck(){
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

      if (flyingBall.position.z < flyingBall.changeStepAtPosZ)
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
  ballControls.arrTarget.forEach(function(item, index) {
      var p = item.position;
      if (p.y < 0|| p.x < -c.roomWidth || p.x > c.roomWidth){
          if (item.body){
              world.removeRigidBody(item.body)
              item.body = null;
          }
          scene.remove(item)
          ballControls.arrTarget.splice(index,1)
          levels.nTarget--;
      }
  });
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
  if (ballControls.arrBall.length === 0){
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
