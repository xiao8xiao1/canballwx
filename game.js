import './libs/weapp-adapter/index'
import './libs/symbol'
import * as THREE from './libs/threejs/three'
import './libs/threejs/controls/OrbitControls'
import * as CANNON from './libs/threejs/cannon'

// import TWEEN from './libs/threejs/tween.min'
// var InitMouseMov = require('mouseMov.js');
var TWEEN = require('./libs/threejs/Tween')
var AssetLoader = require('./libs/threejs/threeUi/AssetLoader');
var ThreeUI = require('./libs/threejs/threeUi/ThreeUI.js');
var PlaceUi = require('ui.js');
var CannonHelper = require('./libs/threejs/cannonhelper');
var BallControls = require('BallControls.js');

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

var movSound = new Audio('audio/collision.mp3');
var winSound = new Audio('audio/level_complete.wav');
var fallSound = new Audio('audio/bullet.mp3');

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
  initControl();
  animate();
}

var ui;
function InitUi(){
  ui = new ThreeUI(renderer.domElement, window.innerHeight, true);  

  var placeUi = new PlaceUi(ui);
  ui.addEventListener ('start', function(e) {
    clearLevel();
    initLevel();
  });
  // ui.addEventListener ('home', removeCubes);  
  ui.addEventListener ('selectDirFile', function(e){
    window.currentDirIndex = e.dirIndex;  window.currentFileIndex = e.fileIndex;
    setDirLevel(window.currentDirIndex, window.currentFileIndex)
    clearLevel();
    initLevel();
  });
  
  ui.addEventListener ('thisAgain', function(e){

  });  

  ui.addEventListener ('playBack', function(e){

  });  

  ui.addEventListener ('next', function(e){

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
  var files = fs.readFileSync('levels/'+window.levelDirs[window.currentDirIndex]+'/dir.txt', "ascii").split("\r\n");
  files.length -= 1;
  console.log(files)
  if (window.currentFileIndex + 1 < files.length)
    window.currentFileIndex++
  else if (window.currentDirIndex + 1 < window.levelDirs.length){
    window.currentDirIndex++;
    window.currentFileIndex = 0;
  }
  else{
    console.log('pass all levels')
    window.currentDirIndex = 0
    window.currentFileIndex = 0
  }
  setDirLevel(window.currentDirIndex, window.currentFileIndex)
}
var c = new function () {
  this.cameraY = 21
  this.cameraZ = 59
  this.LookatY = 13
  this.LookatZ = 0;
  this.zoom = 1
  this.disdanceHalf = 20
  this.forceFactor = 100
  this.ballRad = 1
  this.canRad = 1
  this.canHeight = 4
  this.massBall = 5
  this.massCan = 10
  this.go = function() {
      clearLevel()
      initLevel()
      console.log('c=', c)
  }
};
var camera, scene, renderer, controls;
function initThree() {
    // scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );
    scene.background = new THREE.Color(window.bgColor);//0xc2ebce);
    // camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
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

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor( scene.fog.color );
    renderer.autoClear = false; // To allow render overlay on top of sprited sphere
  
    var axesHelper = new THREE.AxesHelper( 5 );  scene.add( axesHelper );
}
var lastTime;
function animate(time) {
    TWEEN.update();
    controls.update();    
    requestAnimationFrame( animate );
    if(time && lastTime){
        var dt = time - lastTime;
        physics.update(dt / 1000, 3);
    }
    renderer.clear();
    renderer.render( scene, camera );
    ui.render(renderer);    
    lastTime = time;
}

var physics = new CannonHelper(0,-10,0, 1/30);  
var material = new THREE.MeshLambertMaterial( { color: 0x777777 } );
var materialPlane = new THREE.MeshLambertMaterial( { color: 0xf0f0f0 } );            
var ballControls;
var wall = null, ground = null 

function clearLevel(){
  scene.remove(wall);  
  wall = null;

  if(ground){
    scene.remove(ground)
    physics.world.remove(ground.body)
    ground.body = null; ground = null;
  }

  for (var i = 0; i < ballControls.arrTarget.length; ++i){
    if (ballControls.arrTarget[i]) {
      scene.remove(ballControls.arrTarget[i]);
      if (ballControls.arrTarget[i].body)  
        physics.world.remove(ballControls.arrTarget[i].body)
      ballControls.arrTarget[i].body = null; ballControls.arrTarget[i] = null;
    }
  }
  ballControls.arrTarget.splice(0,ballControls.arrTarget.length);

  for (var i = 0; i < ballControls.arrBall.length; ++i){
    if (ballControls.arrBall[i]) {
      scene.remove(ballControls.arrBall[i]);
      if (ballControls.arrBall[i].body)
        physics.world.remove(ballControls.arrBall[i].body)
      ballControls.arrBall[i].body = null; ballControls.arrBall[i] = null;
    }
  }
  ballControls.arrBall.splice(0,ballControls.arrBall.length);
}

function initLevel(){
    //far plane
    wall = new THREE.Mesh( new THREE.PlaneGeometry( 12, 24, 1, 1 ),
                                  new THREE.MeshLambertMaterial( { color: 0xf8f8f8 } ) );
    wall.position.set(0, 6, -c.disdanceHalf - 10)
    scene.add(wall);
    ballControls.arrTarget.push(wall);
    //ground
    ground = new THREE.Mesh( new THREE.PlaneGeometry( 12, 2*c.disdanceHalf + 10, 1, 1 ), materialPlane );
    ground.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI / 2);
    ground.body = physics.addBody( ground, 0 );  scene.add(ground);
    ground.body.position.set(0,0,0,)
    pileUp(3,3,-c.disdanceHalf - 3)
    pileUp(4,4,-c.disdanceHalf)
    for (var i = 0; i < 6; ++i)
    {
    var ball = new THREE.Mesh(new THREE.SphereGeometry(c.ballRad, 20, 20), material);
    ball.body = physics.addBody( ball, c.massBall );  scene.add(ball);
        ball.body.position.set(-5+i*(c.ballRad*2), c.ballRad , c.disdanceHalf);
    ballControls.arrBall.push(ball);
    }
    function pileUp(xCnt, yCnt, zPos){
        var interval = 2*c.canRad/3;
        for (var level = 0; level < yCnt; ++level){
            var xc = xCnt - level;
            var startX = -((xc - 1)*interval + (xc*2*c.canRad))/2 + c.canRad;
            for (var i = 0; i < xc; ++i){
                var can = new THREE.Mesh(new THREE.CylinderGeometry(c.canRad,c.canRad,c.canHeight,20,20,false), material);
                can.body = physics.addBody( can, c.massCan );  scene.add(can);
                can.body.position.set(startX + i*(interval + 2*c.canRad) , c.canHeight/2 + level*c.canHeight, zPos);   
                ballControls.arrTarget.push(can);
            }
        }
    }
}
function initControl(){
    ballControls = new BallControls(camera, renderer.domElement, ballProcess);
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set (0, 5, 0)
    controls.update();
}

var ballProcess = {
  zero : new CANNON.Vec3(0,0,0),
  selectBall : function (){
    controls.enabled = false;
    console.log(camera.position)
  },
  throwBall: function (ball, to,delta){
    controls.enabled = true;
    to.sub(ball.position).normalize()
    to.divideScalar(delta).multiplyScalar (c.forceFactor)
    console.log(to)
    ball.body.applyLocalImpulse(to, this.zero);
    ball.body.wakeUp();
  }
}