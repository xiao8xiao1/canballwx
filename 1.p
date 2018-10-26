diff --git a/BallControls.js b/BallControls.js
index ff93e6e..6a6aab2 100644
--- a/BallControls.js
+++ b/BallControls.js
@@ -1,6 +1,6 @@
 // import * as THREE from './libs/threejs/three'
 
-var BallControls = function(camera, domElement, gl, arrTarget, arrBall) {
+var BallControls = function(scene, camera, domElement, gl, arrTarget, arrBall) {
     var scope = this;
     scope.enabled = true;
     var clock = new THREE.Clock();
@@ -17,7 +17,11 @@ var BallControls = function(camera, domElement, gl, arrTarget, arrBall) {
     var ray = new THREE.Raycaster();
     var startPointer = new THREE.Vector2();
     var endPointer = new THREE.Vector2();
-
+    var mov2 = new THREE.Vector2();
+    var planeGeometry = new THREE.PlaneBufferGeometry(window.innerWidth*2 , window.innerHeight, 2, 2);
+    var planeMaterial = new THREE.MeshBasicMaterial({ visible: false, color: 0x808000, transparent :true, opacity :0.5 });
+    var planeXY = new THREE.Mesh(planeGeometry, planeMaterial); scene.add(planeXY);
+    scene.add(planeXY)
     // wx.onTouchStart(onMouseDown)
     // wx.onTouchMove(onMouseMove)
     // wx.onTouchEnd(onMouseUp)
@@ -32,49 +36,63 @@ var BallControls = function(camera, domElement, gl, arrTarget, arrBall) {
     //  window.removeEventListener( 'mousemove', onMouseMove, false );
     //  window.removeEventListener( 'mouseup', onMouseUp, false );
     // };
-
+    var clickOffsetX = 0;
+    var isMovUp = false;
     function onMouseDown(e){
         if ( scope.enabled === false ) return;       
-        clock.getDelta();
-        // Find mesh from a ray
         var pointer = e.changedTouches ? e.changedTouches[0] : e;
         startPointer.x = pointer.clientX;
         startPointer.y = pointer.clientY;
-            
+
         var entity = intersectObjects(startPointer.x, startPointer.y, arrBall)
-        // var pos = entity.point;
-        if(/*pos &&*/ entity){
+
+        if(entity){
             selectBall = entity.object
             gl.selectBall(selectBall)
-            // scope.dispatchEvent( { type: 'selectBall' } );
-            // Set the movement plane
-            // setScreenPerpCenter(pos,camera);
-            // var idx = arrBall.indexOf(entity.object);
-            // if(idx !== -1){
-            // }
-        }
-        // e.preventDefault();
-        // e.stopPropagation();        
+            planeXY.position.copy(selectBall.position)
+            clickOffsetX = entity.point.x - selectBall.position.x;
+
+            isMovUp = false;
+        } else
+            selectBall = null;
     }
     function onMouseMove(e){
         if ( scope.enabled === false ) return;
         if (!selectBall) return;
-        // Move and project on the plane
-        // if (gplane) {
-        //    var pos = projectOntoPlane(e.clientX,e.clientY,gplane,camera);
-        //    if(pos){
-        //    }
-        // }
-        // e.preventDefault();
-        // e.stopPropagation();
+        var pointer = e.changedTouches ? e.changedTouches[0] : e;
+
+        mov2.x = pointer.clientX - startPointer.x;
+        mov2.y = startPointer.y - pointer.clientY;
+       
+        var entity = intersectObjects(pointer.x, pointer.y, [planeXY])
+        if(entity)
+        {
+            console.log(entity.point)
+            // console.log
+            if (entity.point.y < selectBall.position.y + selectBall.scale.y 
+                && Math.abs(mov2.x) > 0.2 && mov2.y*5 < Math.abs(mov2.x)){
+                if (selectBall.body)
+                    selectBall.body.setPosition( {x:entity.point.x - clickOffsetX, y:selectBall.body.position.y, z:selectBall.body.position.z});
+                isMovUp = false;
+            }else{
+                if (!isMovUp){
+                    isMovUp = true;
+                    clock.getDelta();
+                }
+            }
+        }
     }
     function onMouseUp(e) {
         if ( scope.enabled === false ) return;
         if (!selectBall) return;
+        if (!isMovUp) {
+            selectBall = null;
+            return;
+        }
         var delta = clock.getDelta();
         var pointer = e.changedTouches ? e.changedTouches[0] : e;
         endPointer.x = pointer.clientX;
-        endPointer.y = pointer.clientY;               
+        endPointer.y = pointer.clientY;
         var entity = intersectObjects(endPointer.x, endPointer.y, arrTarget)
         if(entity)
         {
diff --git a/canBallLevels.js b/canBallLevels.js
index 8128482..91688e7 100644
--- a/canBallLevels.js
+++ b/canBallLevels.js
@@ -1,5 +1,5 @@
 // import * as OIMO from './libs/threejs/oimo'
-var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
+var CanBallLevels = function(camera, c, world, hp, arrTarget, arrBall, arrAttached){
     var levelFuncs = [];    
     
     var canWidth = 2*c.canRad,
@@ -16,11 +16,15 @@ var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
     }
     this.nearestZ = -c.disdanceHalf
     var _this = this;
+    _this.ballCnt = 0
+
+    var zPos = -c.disdanceHalf+canRad, yPos=0;
 
     this.getCnt= function(){
         return levelFuncs.length;
     }
     this.go = function(index){
+        yPos=0;
         this.nTarget = 0
       // far plane
       var wall = hp.addBox(c.roomWidth*2, 80,4*c.canRad,   0,0,-c.disdanceHalf-2*c.canHeight, {restitution:0.005});
@@ -28,9 +32,124 @@ var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
         if (index < levelFuncs.length)
             levelFuncs[index]();
     }
-    function addDesk(h, zPos){
-        var desk = hp.addBox(c.roomWidth,h,canRad*2,  0, h/2, zPos);
+
+    var GUP = function(){
+        this.objs = [];
+        this.scale = {x:0,y:0,z:0}
+    }
+    var G_ = function(){
+        this.objs = [];
+        this.scale = {x:0,y:0,z:0}
+    }
+
+    GUP.prototype.d = G_.prototype.d = function(h, z){
+        this.objs.push(addDesk(h, z))
+    }
+    GUP.prototype.c = G_.prototype.c = function(){
+        this.objs.push(addCan())
+    }
+
+    GUP.prototype.g = G_.prototype.g = function(group){
+        this.objs.push(group)
+    }
+
+    G_.prototype.o = function(x){
+        this.objs.push({
+              scale:{x:x}, 
+              position:{  set:function(){}  },
+              body:{
+                 position:{  set:function(){}  }
+              }
+            })
+    }
+
+    GUP.prototype.posLeft = function(x, y, z){
+        this.endY = y;
+        this.scale.x = 0;
+
+        this.objs.forEach(item => {
+            if (this.scale.x < item.scale.x) //找出最宽
+                this.scale.x = item.scale.x;
+
+            if (item.objs){//组对象
+                item.posLeft(x, this.endY, z)
+            }
+            else{
+                var posX = x + item.scale.x/2;
+                var posY = this.endY + item.scale.y/2;
+                item.body.position.set(posX, posY, z)
+                if (item.body.type === 2) {//static
+                    item.body.syncShapes();
+                    item.position.set(posX, posY, z)
+                }
+            }
+            this.endY += item.scale.y
+        });
+
+        this.scale.y = this.endY - y;
+    }
+
+    GUP.prototype.posMid = function(){
+        this.objs.forEach(item => {
+            if (item.objs){//组对象
+                item.posMid()
+            }
+            else {
+                item.body.position.x -=  item.scale.x/2
+                if (item.body.type === 2) {//static
+                    item.body.syncShapes();
+                    item.position.position.x -= item.scale.x/2
+                }
+            }
+        })
+    }
+
+    G_.prototype.posLeft = function(x, y, z){
+        this.endX = x;
+        this.scale.y = 0;
+        this.objs.forEach(item => {
+            if (this.scale.y < item.scale.y) //找出最高
+                this.scale.y = item.scale.y;
+
+            if (item.objs){//组对象
+                item.posLeft(x, y, z)
+            }
+            else {
+                var posX = this.endX + item.scale.x/2;
+                var posY = y + item.scale.y/2;
+                item.body.position.set(posX, posY, z)
+                if (item.body.type === 2) {//static
+                    item.body.syncShapes();
+                    item.position.set(posX, posY, z)        
+                }
+            }
+            this.endX += item.scale.x
+
+        });
+        this.scale.x = this.endX - x;
+    }
+    G_.prototype.posMid = function(){
+        var movX = this.scale.x/2
+        this.objs.forEach(item => {
+            if (item.objs){//组对象
+                item.posMid()
+            }
+            else {
+                item.body.position.x -=  movX
+                if (item.body.type === 2) {//static
+                    item.body.syncShapes();
+                    item.position.x -= movX
+                }
+            }
+        })
+    }
+
+    function addDesk(h, z){
+        h = h || c.deskHight;
+        z = z || zPos;
+        var desk = hp.addBox(c.roomWidth,h,canRad*2,  0, h/2, z);
         arrTarget.push(desk);
+        return desk;
     }
     function addBox(w, h, xPos,yPos,zPos, o){
         var desk = hp.addBox(w, h, canRad*2,  xPos, yPos+h/2, zPos, o)
@@ -39,6 +158,7 @@ var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
     }
     function addCan(xPos,yPos,zPos,o)
     {
+        xPos = xPos || 0;  yPos = yPos || 0;  zPos = zPos || 0;
         var can = hp.addCan(canWidth,canHeight,  xPos,yPos+canHeight/2,zPos,o)
         arrTarget.push(can); 
         _this.nTarget++;
@@ -50,12 +170,25 @@ var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
         var ball = hp.addBall(ballWidth, xPos, c.groundY+ballRad , c.disdanceHalf, o)
         arrBall.push(ball);
     }
+
+    this.addTheBall = function() {
+        if (_this.ballCnt > 0){
+            var ball = hp.addBall(ballWidth, 0, c.groundY+ballRad , c.disdanceHalf, {kinematic:true})
+            ball.material = ball.material.clone();
+            ball.material.opacity = 0;
+            new TWEEN.Tween(ball.material).to({opacity: 1}, 500).delay(500).start()
+            arrBall.push(ball);
+            _this.ballCnt--;
+        }
+    }
     function addBalls(cnt){
         if (cnt === undefined)
             cnt = Math.floor(c.roomWidth/(2*ballRad))
-        var startX = -(cnt*ballRad) + ballRad;
-        for (var i = 0; i < cnt; ++i)
-            addBall(startX + i* 2*ballRad)
+        // var startX = -(cnt*ballRad) + ballRad;
+        // for (var i = 0; i < cnt; ++i)
+        //     addBall(startX + i* 2*ballRad)
+        _this.ballCnt = cnt
+        _this.addTheBall()
     }   
     function addSwingBox(w, h, xPos,yPos,zPos){
         var desk = addBox(w, h, xPos,yPos,zPos, {move:true})
@@ -109,40 +242,72 @@ var CanBallLevels = function(c, world, hp, arrTarget, arrBall, arrAttached){
         addCan(xPos , yPos, zPos);
     }
     ////////////////////////////////
-    function attach2body(body1, staticBody, attachToPos){
-        body1.attachTo = staticBody
+    function attach2body(body1, kineBody, attachToPos){
+        body1.attachTo = kineBody
         body1.attachToPos = attachToPos
         arrAttached.push(body1)
     }
     function addJoint(w, h, xPos,yPos,zPos){
-        _this.nTarget++;
         var ball = hp.addBall(ballWidth, xPos, yPos, zPos, {kinematic:true});  arrTarget.push(ball);
         var box = addCan(xPos,yPos-ballRad-h,zPos);
         box.body.isKinematic = true;
         attach2body(box.body, ball.body, new OIMO.Vec3(0,-ballRad-canHeight/2, 0))
         return ball.body;
     }
+
+    levelFuncs.push(function()
+    {
+        addDesk(); yPos = c.deskHight;
+        var gUp = new GUP();
+
+        var g1_ = new G_();  gUp.g(g1_)
+        g1_.c();  g1_.o(ballRad);  g1_.c();  g1_.o(ballRad);  g1_.c();
+        g1_.posLeft(0, 0, 0); 
+
+        var g2_ = new G_();  gUp.g(g2_)
+        g2_.d(1)
+        g1_.posLeft(0, 0, 0); 
+
+        var g_ = new G_();  gUp.g(g_)
+        g_.c();  g_.o(ballRad);  g_.c();  g_.o(ballRad);  g_.c();
+        g_.posLeft(0, 0, 0); 
+        
+        gUp.posLeft(0, yPos, zPos); gUp.posMid();
+        
+        addBalls(6)
+    })
+
+
     levelFuncs.push(function()
     {
+        var gUp = new GUP();
         var zPos = -c.disdanceHalf+canRad, yPos=0;
-        addDesk(c.deskHight, zPos); 
-        yPos+=c.deskHight;
-        addCan(0,yPos,zPos)
+        gUp.d();
+        // yPos+=c.deskHight;
+        gUp.c();
+        gUp.c();
+        gUp.c();
+        gUp.pos(0, 0, zPos)
         addBalls(6)
         var ballBody = addJoint(4,4,  -10, 20, 0);
         var tween = new TWEEN.Tween(ballBody.position)
-        tween.repeat(10)
+        tween.repeat(2)
         tween.yoyo(true).to({x: 10}, 2000)
         tween.start()
     })    
+
     levelFuncs.push(function()
     {
         var zPos = -c.disdanceHalf+canRad, yPos=0;
         addDesk(c.deskHight, zPos); 
         yPos+=c.deskHight;
         addCan(0,yPos,zPos)
-        addBall(0)
-    })    
+        addBalls(6)
+        var ballBody = addJoint(4,4,  0, 14, 0);
+        var tween = new TWEEN.Tween(ballBody.position).to({y: 24, repeat:10, yoyo:true}, 2000)
+        tween.start()
+    })
+
     levelFuncs.push(function()
     {
         var zPos = -c.disdanceHalf+canRad, yPos=0;
diff --git a/canball.html b/canball.html
index e7be1d8..78a56ad 100644
--- a/canball.html
+++ b/canball.html
@@ -11,15 +11,6 @@
                 padding:0;
                 overflow: hidden;
             }
-            #blocker {
-                position: absolute;
-                top:0px;
-                left:0px;
-                width: 304px;  
-                height: 540px; 
-                background-color: rgb(255,0,0);
-                overflow: hidden;
-            }
         </style>
     <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
     </head>
@@ -47,13 +38,21 @@ c.go = function() {
         gl.initLevel(c.level)
         console.log('c=', c)
     }
-function showPassLevel(){
-    c.level++;
+function showPassLevel(succ){
+    c.level += succ;
     if (c.level > levels.getCnt())
         c.level = 0;
     gl.initLevel(c.level);
+    console.log('Enter level', c.level)
 }
 var gui = new dat.GUI();
+window.addEventListener( 'mousedown', function(e){
+     if (e.shiftKey)
+         gui.closed = !gui.closed; 
+     else if (e.ctrlKey)
+        gl.initLevel(c.level);
+    }, false );
+
 function initGui(){
     gui.add(c, 'gravity', 10, 100).onChange(function(y){
         world.setGravity([0,-y,0])
@@ -93,19 +92,19 @@ function initGui(){
     gui.add(c, 'massBall', 0, 20);
     gui.add(c, 'massCan', 0, 20);
     gui.add(c, 'shootHeight', 0, 10);
-    gui.add(c, 'level')
+    gui.add(c, 'level').onChange(function(){
+        c.go()
+    })
     gui.add(c, 'go');
+    gui.closed = true;
 }
 //to wx
 
 var camera, scene, renderer
 var controls = {}
 function initThree() {
-    var container = document.getElementById('blocker');
-    var W = container.offsetWidth, H = container.offsetHeight;
-
-    // var container = document.createElement( 'div' );  document.body.appendChild( container );  
-    // var W = window.innerWidth, H = window.innerHeight;
+    var container = document.createElement( 'div' );  document.body.appendChild( container );  
+    var W = window.innerWidth, H = window.innerHeight;
     console.log(window.innerHeight, W, H)
     // scene
     scene = new THREE.Scene();
@@ -133,9 +132,9 @@ function initThree() {
     var axesHelper = new THREE.AxesHelper( 5 );  scene.add( axesHelper );
     container.appendChild( renderer.domElement );
 
-    controls = new THREE.OrbitControls( camera, renderer.domElement );
-    controls.target.set (0, c.LookatY, c.LookatZ)
-    controls.update();
+    // controls = new THREE.OrbitControls( camera, renderer.domElement );
+    // controls.target.set (0, c.LookatY, c.LookatZ)
+    // controls.update();
 }
 var lastTime;
 function animate(time) {
@@ -165,9 +164,9 @@ function initOther() {
   world = new OIMO.World({gravity: [0,-c.gravity,0], random:false, iterations:8})    // physics = new CannonHelper(0,-c.gravity,0, 1/60);  world=physics.world;
   hp = new OimoHelper(world, scene);
 
-  levels = new CanBallLevels(c, world, hp, arrTarget, arrBall, arrAttached)
+  levels = new CanBallLevels(camera, c, world, hp, arrTarget, arrBall, arrAttached)
   gl = new GameLogic(c, scene, world, hp, levels, particle, arrTarget, arrBall, arrAttached, controls)
-  ballControls = new BallControls(camera, renderer.domElement, gl, arrTarget, arrBall)
+  ballControls = new BallControls(scene, camera, renderer.domElement, gl, arrTarget, arrBall);
 }
 
 initGui()
diff --git a/game.js b/game.js
index 78a82c8..d8cc033 100644
--- a/game.js
+++ b/game.js
@@ -218,7 +218,7 @@ function initOther() {
   world = new OIMO.World({gravity: [0,-c.gravity,0], random:false, iterations:8})    // physics = new CannonHelper(0,-c.gravity,0, 1/60);  world=physics.world;
   hp = new OimoHelper(world, scene);
 
-  levels = new CanBallLevels(c, world, hp, arrTarget, arrBall, arrAttached)
+  levels = new CanBallLevels(camera, c, world, hp, arrTarget, arrBall, arrAttached)
   gl = new GameLogic(c, scene, world, hp, levels, particle, arrTarget, arrBall, arrAttached, controls)
   ballControls = new BallControls(camera, renderer.domElement, gl, arrTarget, arrBall)
 }
\ No newline at end of file
diff --git a/gameLogic.js b/gameLogic.js
index 922c5b9..e4d8463 100644
--- a/gameLogic.js
+++ b/gameLogic.js
@@ -70,13 +70,16 @@ var GameLogic = function(c, scene, world, hp, levels, particle, arrTarget, arrBa
     controls.enabled = true;
     particle.createTail(ball)
     var flyingBall = ball.body;
-    if (!flyingBall)
+    if (!flyingBall){
       console.log('flyingBall err.', ball)
+      return;
+    }
     to.sub(flyingBall.position).normalize()
     var temp = tDist/delta;
     console.log('tD tT  tv', tDist, delta, temp)
     to.multiplyScalar(temp*c.forceFactor)
     flyingBall.linearVelocity.copy(to)  //flyingBall.applyImpulse(this.zero, to);
+    flyingBall.isKinematic = false
   
   // var to = new THREE.Vector3();
   // to.set(0,c.shootHeight,-38)
@@ -95,6 +98,8 @@ var GameLogic = function(c, scene, world, hp, levels, particle, arrTarget, arrBa
     flyingBalls.push(flyingBall)
     var index = arrBall.indexOf(flyingBall.mesh)
     arrBall.splice(index, 1)
+    // setTimeout(levels.addTheBall, 1000)
+    levels.addTheBall();
     ball.body.onCollide = function(bodyOther, pos){
         if (bodyOther !== ground.body){
             if (bodyOther.isDynamic)
@@ -171,7 +176,7 @@ var GameLogic = function(c, scene, world, hp, levels, particle, arrTarget, arrBa
           winSound1.play();
         else
           winSound2.play();
-        window.showPassLevel();  
+        window.showPassLevel(1);
         return;
     }
     if (arrBall.length === 0){
@@ -192,11 +197,11 @@ var GameLogic = function(c, scene, world, hp, levels, particle, arrTarget, arrBa
         else
           winSound2.play();
   
-        window.showPassLevel();  
+        window.showPassLevel(1);  
     }
     else{
         console.log('failed')
-        window.showPassLevel();  
+        window.showPassLevel(0);  
     }
   }  
 }
diff --git a/oimoHelper.js b/oimoHelper.js
index a922a16..61f231d 100644
--- a/oimoHelper.js
+++ b/oimoHelper.js
@@ -10,9 +10,9 @@ var OimoHelper = function  (world, scene) {
     var mats = {};
     var materialType = 'MeshPhongMaterial'; //'MeshBasicMaterial';
 
-    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1,16,10));
+    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(0.5,16,10));
     geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1,1,1));
-    geos['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1,1,1));
+    geos['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(0.5,0.5,1));
     mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
     mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );
     mats['cyl']    = new THREE[materialType]( {shininess: 10, map: basicTexture(4), name:'cyl' } );
@@ -24,7 +24,7 @@ var OimoHelper = function  (world, scene) {
 
         move: new THREE.MeshLambertMaterial({ name:'move', color:0x888800 }),
         contact: new THREE.MeshBasicMaterial({ name:'contact', color:0xA8BB19 }),
-        sleep: new THREE.MeshLambertMaterial({ name:'sleep', color:0x777777 }),
+        sleep: new THREE.MeshLambertMaterial({ name:'sleep', color:0x777777 , transparent:true}),
         statique: new THREE.MeshBasicMaterial({ name:'statique', color:0x333399, transparent:true, opacity:0.6 }),
         donut: new THREE.MeshBasicMaterial({ name:'donut', color:0xFFD700 }),
         kinematic: new THREE.MeshBasicMaterial({ name:'kinematic', color:0x33AA33, transparent:true, opacity:0.6 }),
@@ -46,7 +46,7 @@ var OimoHelper = function  (world, scene) {
             
         var b = world.add(o);
         var m = new THREE.Mesh( geos.sphere, mats.sph );
-        m.scale.set( w*0.5, w*0.5, w*0.5 );
+        m.scale.set( w, w, w );
         m.body = b;  
         b.connectMesh(m);
         scene.add(m)
@@ -76,7 +76,7 @@ var OimoHelper = function  (world, scene) {
 
         var b = world.add(o);
         var m = new THREE.Mesh( geos.cylinder, mats.cyl );
-        m.scale.set( w*0.5, h, w*0.5 );
+        m.scale.set( w, h, w );
         m.body = b;  
         b.connectMesh(m);
         scene.add(m)
