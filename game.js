import './libs/weapp-adapter/index'
import './libs/symbol'
import * as THREE from './libs/threejs/three'
import './libs/threejs/controls/OrbitControls'
import * as OIMO from './libs/threejs/oimo'
// import CanBallLevels from 'canBallLevels'

var Particle = require('Particle.js');
var CanBallLevels = require('canBallLevels');

// import TWEEN from './libs/threejs/tween.min'
// var InitMouseMov = require('mouseMov.js');
var TWEEN = require('./libs/threejs/Tween')
var AssetLoader = require('./libs/threejs/threeUi/AssetLoader');
var ThreeUI = require('./libs/threejs/threeUi/ThreeUI.js');
var PlaceUi = require('ui.js');
var OimoHelper = require('oimoHelper');
var BallControls = require('BallControls.js');
var Config = require('config.js');
var GameLogic = require('gameLogic.js');
window.THREE = THREE
window.OIMO = OIMO
window.Particle = Particle
window.TWEEN = TWEEN

//debug del at release
import * as SPE from './libs/threejs/SPE'
window.SPE = SPE

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
  initOther();
  InitUi()
  animate();
}

var ui;
function InitUi(){
  ui = new ThreeUI(renderer.domElement, window.innerHeight, true);  

  var placeUi = new PlaceUi(ui);
  ui.addEventListener ('start', function(e) {
    gl.initLevel();
  });
  // ui.addEventListener ('home', removeCubes);  
  ui.addEventListener ('selectDirFile', function(e){
    window.currentDirIndex = e.dirIndex;  window.currentFileIndex = e.fileIndex;
    setDirLevel(window.currentDirIndex, window.currentFileIndex)
    gl.initLevel();
  });
  
  ui.addEventListener ('thisAgain', function(e){
    gl.initLevel();
  });  

  ui.addEventListener ('playBack', function(e){

  });  

  ui.addEventListener ('next', function(e){
    passDirLevel()
    gl.initLevel();
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
var c = new Config();
var camera, scene, renderer
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
}

function animate(time) {
  TWEEN.update();
  requestAnimationFrame( animate );
  var lastTime;
  // if(time && lastTime){
  //     var dt = (time - lastTime)/1000;
  //     // for (i = 0; i < 10; ++i)
  //         physics.update(dt, 5);
  //     particle.tick(dt)
  // }
  world.step();
  gl.flyingCheck();
  world.step();
  gl.flyingCheck();

  renderer.clear();
  renderer.render( scene, camera );
  ui.render(renderer);    
  lastTime = time;
}

var hp, world, levels, gl, ballControls, particle;
var arrBall = [], arrTarget = [], arrAttached = [];
function initOther() {
  particle = new Particle(scene);   particle.initParticles();
  world = new OIMO.World({gravity: [0,-c.gravity,0], random:false, iterations:8})    // physics = new CannonHelper(0,-c.gravity,0, 1/60);  world=physics.world;
  hp = new OimoHelper(world, scene);

  levels = new CanBallLevels(c, world, hp, arrTarget, arrBall, arrAttached)
  gl = new GameLogic(c, scene, world, hp, levels, particle, arrTarget, arrBall, arrAttached, controls)
  ballControls = new BallControls(camera, renderer.domElement, gl, arrTarget, arrBall)
}