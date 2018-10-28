// import * as OIMO from './libs/threejs/oimo'
var canWidth ,canRad ,canHeight ,ballRad ,ballWidth , deskHeight, roomWidth, boardHeight
var zPos;
var CanBallLevels = function(camera, cfg, world, hp, arrTarget, arrBall, arrAttached){
    var levelFuncs = [];

    this.setPara = function(cfg){
        canWidth = 2*cfg.canRad
        canRad = cfg.canRad
        canHeight = cfg.canHeight
        ballRad = cfg.ballRad
        ballWidth = 2*cfg.ballRad
        deskHeight = cfg.deskHeight
        roomWidth = cfg.roomWidth
        boardHeight = cfg.boardHeight
    }
    this.setPara(cfg);
    this.nearestZ = -cfg.disdanceHalf
    var _this = this;
    _this.ballCnt = 0

    zPos = -cfg.disdanceHalf+canRad;

    this.getCnt= function(){
        return levelFuncs.length;
    }
    this.go = function(index){
      this.nTarget = 0
      // far plane
      var wall = hp.addBox(cfg.roomWidth*2, 80,4*cfg.canRad,   0,0,-cfg.disdanceHalf-2*cfg.canHeight, {restitution:0.005, wall:true});
      arrTarget.push(wall);
        if (index < levelFuncs.length)
            levelFuncs[index]();
    }

    var dsk = function (h,z){
        h = h || deskHeight;
        z = z || zPos;
        var desk = hp.addBox(roomWidth,h,canRad*2,  0, h/2, z);
        arrTarget.push(desk);
        return desk;
    }
    var bd = function (w){
        w = w || roomWidth/2
        var bd = hp.addBox(w, boardHeight, canRad*2,  0, 0, 0, {move:true})
        arrTarget.push(bd);
        return  bd ;
    }
    var c = function (xPos, yPos, zPos, o){
        xPos = xPos || 0;  yPos = yPos || 0;  zPos = zPos || 0; o = o || {};
        var can = hp.addCan(canWidth,canHeight,  xPos,yPos+canHeight/2,zPos,o)
        arrTarget.push(can); 
        _this.nTarget++;
        if (zPos + canRad > _this.nearestZ)  _this.nearestZ = zPos + canRad;
        return can;
    }

    function addDesk(h, z){
        h = h || cfg.deskHeight;
        z = z || zPos;
        var desk = hp.addBox(cfg.roomWidth,h,canRad*2,  0, h/2, z);
        arrTarget.push(desk);
        return desk;
    }

    function addBox(w, h, xPos,yPos,zPos, o){
        var desk = hp.addBox(w, h, canRad*2,  xPos, yPos+h/2, zPos, o)
        arrTarget.push(desk);
        return desk;
    }
    function addCan(xPos,yPos,zPos,o)
    {
        xPos = xPos || 0;  yPos = yPos || 0;  zPos = zPos || 0;
        var can = hp.addCan(canWidth,canHeight,  xPos,yPos+canHeight/2,zPos,o)
        arrTarget.push(can); 
        _this.nTarget++;
        if (zPos + canRad > _this.nearestZ)  _this.nearestZ = zPos + canRad;
        return can;
    }
    function addBall(xPos, o)
    {
        var ball = hp.addBall(ballWidth, xPos, cfg.groundY+ballRad , cfg.disdanceHalf, o)
        arrBall.push(ball);
    }

    this.addTheBall = function() {
        if (_this.ballCnt > 0){
            var ball = hp.addBall(ballWidth, 0, cfg.groundY+ballRad , cfg.disdanceHalf, {kinematic:true})
            ball.material = ball.material.clone();
            ball.material.opacity = 0;
            new TWEEN.Tween(ball.material).to({opacity: 1}, 500).delay(500).start()
            arrBall.push(ball);
            _this.ballCnt--;
        }
    }
    function addBalls(cnt){
        if (cnt === undefined)
            cnt = Math.floor(cfg.roomWidth/(2*ballRad))
        // var startX = -(cnt*ballRad) + ballRad;
        // for (var i = 0; i < cnt; ++i)
        //     addBall(startX + i* 2*ballRad)
        _this.ballCnt = cnt
        _this.addTheBall()
    }   
    function addSwingBox(w, h, xPos,yPos,zPos){
        var desk = addBox(w, h, xPos,yPos,zPos, {move:true})
        var ball = hp.addBall(ballWidth, xPos, yPos+h+ballRad+w/2, zPos, {move:false})
        arrTarget.push(ball);
        var spring = [2, 0.3];
        world.add({ type:'jointHinge', body1:ball.body, body2:desk.body, pos1:[0, 0, 0], pos2:[0, h/2+ballRad, 0],
                    collision:false, spring:spring, min:90, max:-90, axe1:[0,0,1], axe2:[0,0,1]  });
        desk.body.applyImpulse(new OIMO.Vec3(0,0,0), new OIMO.Vec3(100,0,0));
    }

    
    function pileUpTBox(xPos,yPos,zPos){
        addBox(canRad*2, canHeight*2,    xPos,yPos,zPos)
        addBox(canHeight*2, canRad,  xPos,yPos+canHeight*2,zPos, {move:true})
        return [xPos-canHeight+canRad, xPos+canHeight-canRad, yPos+canHeight*2+canRad]
    }
    function pileUpTriangle(xCnt, yCnt, xPos,yPos,zPos){
        var interval = 2*canRad/3;
        for (var level = 0; level < yCnt; ++level){
            var xc = xCnt - level;
            var startX = xPos-((xc - 1)*interval + (xc*2*canRad))/2 + canRad;
            for (var i = 0; i < xc; ++i){
                addCan(startX + i*(interval + 2*canRad) , yPos + level*canHeight, zPos);
            }
        }
    }
    function pileUpLine(cnt,  xPos,yPos,zPos){
        for (var level = 0; level < cnt; ++level){
            addCan(xPos , yPos + level*canHeight, zPos);
        }
    }
    function pileUp121(xPos,yPos,zPos){
        addCan(xPos , yPos, zPos);
        addCan(xPos-1.1*canRad, yPos + 1*canHeight, zPos);
        addCan(xPos+1.1*canRad, yPos + 1*canHeight, zPos);
        addCan(xPos , yPos + 2*canHeight, zPos);

    }
    //offsetPercent  (-0.9, 0.9)
    function pileUp111(xPos,yPos,zPos,offset){
        if (offset === undefined)
            offset = (Math.random()*0.5-1.0)*canRad
        addCan(xPos+offset, yPos, zPos);
        addCan(xPos, yPos + 1*canHeight, zPos);
        addCan(xPos+offset, yPos + 2*canHeight, zPos);
    }
    function pileUp221(xPos,yPos,zPos){
        addCan(xPos - 1.2*canRad, yPos, zPos);  addCan(xPos + 1.2*canRad, yPos, zPos); yPos+=canHeight
        addCan(xPos - 1.8*canRad, yPos, zPos);  addCan(xPos + 1.8*canRad, yPos, zPos); yPos+=canHeight
        addCan(xPos , yPos, zPos);
    }
    ////////////////////////////////
    function attach2body(body1, kineBody, attachToPos){
        body1.attachTo = kineBody
        body1.attachToPos = attachToPos
        arrAttached.push(body1)
    }
    function addJoint(w, h, xPos,yPos,zPos){
        var ball = hp.addBall(ballWidth, xPos, yPos, zPos, {kinematic:true});  arrTarget.push(ball);
        var box = addCan(xPos,yPos-ballRad-h,zPos);
        box.body.isKinematic = true;
        attach2body(box.body, ball.body, new OIMO.Vec3(0,-ballRad-canHeight/2, 0))
        return ball.body;
    }
//0
    levelFuncs.push(function()
    {
        var gUp, __g, llg;

        gUp = ll();
        gUp.pu(dsk());
        __g = __();
        __g.pu(c(),  o(),  c(),  o(),  c());
        __g.end(gUp)

        gUp.pu(bd())

        __g = __();
        __g.pu(c(),  o(),  c(),  o(),  c());
        __g.end(gUp)
        
        gUp.pos(0, 0, zPos); 
        
        addBalls(6)
    })


    levelFuncs.push(function()
    {
        var gUp = new GUP();
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        gUp.d();
        // yPos+=cfg.deskHeight;
        gUp.c();
        gUp.c();
        gUp.c();
        gUp.pos(0, 0, zPos)
        addBalls(6)
        var ballBody = addJoint(4,4,  -10, 20, 0);
        var tween = new TWEEN.Tween(ballBody.position)
        tween.repeat(2)
        tween.yoyo(true).to({x: 10}, 2000)
        tween.start()
    })    

    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        addDesk(cfg.deskHeight, zPos); 
        yPos+=cfg.deskHeight;
        addCan(0,yPos,zPos)
        addBalls(6)
        var ballBody = addJoint(4,4,  0, 14, 0);
        var tween = new TWEEN.Tween(ballBody.position).to({y: 24, repeat:10, yoyo:true}, 2000)
        tween.start()
    })

    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        addDesk(cfg.deskHeight, zPos); yPos+=cfg.deskHeight;
        pileUpTriangle(4,3,  0,yPos,zPos)
        addBalls(3)
    })    
    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        addDesk(cfg.deskHeight, zPos); yPos+=cfg.deskHeight;
        pileUpTriangle(5,4,  0,yPos,zPos)
        addBalls(3)
    })        
    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        addDesk(cfg.deskHeight, zPos); yPos+=cfg.deskHeight;
        pileUp111(0, yPos,zPos, 0)
        pileUp111(-canWidth-canRad, yPos,zPos, -0.8*canRad)
        pileUp111( canWidth+canRad, yPos,zPos,  0.8*canRad)
        addBalls(3)
    })
    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad, yPos=0;
        addDesk(cfg.deskHeight, zPos); yPos+=cfg.deskHeight;
        pileUp221(0, yPos,zPos)
        addBalls(3)
    })
    levelFuncs.push(function()
    {
        var zPos = -cfg.disdanceHalf+canRad;
        addDesk(cfg.deskHeight, zPos)
        var l, r, h;
        [l,r,h]  = pileUpTBox(0,cfg.deskHeight,zPos)
        addCan(l, h, zPos)
        addCan(r, h, zPos)
        addBalls(6)
        addSwingBox(canRad*2, canHeight*2,  0,cfg.deskHeight, zPos+canRad*4)   
    })
    levelFuncs.push(function()
    {
        addDesk(cfg.deskHeight, -cfg.disdanceHalf+canRad)
        pileUp111( 0,       cfg.deskHeight,-cfg.disdanceHalf+canRad)
        pileUp111( 4*canRad,cfg.deskHeight,-cfg.disdanceHalf+canRad )
        // pileUp111(-4*canRad,cfg.deskHeight,-cfg.disdanceHalf+canRad )
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(cfg.deskHeight, -cfg.disdanceHalf+canRad)
        pileUpLine(3, 0,cfg.deskHeight,-cfg.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(cfg.deskHeight, -cfg.disdanceHalf+canRad)
        pileUp121(0,cfg.deskHeight,-cfg.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(cfg.deskHeight, -cfg.disdanceHalf+canRad)
        pileUpTriangle(3,3, 0,cfg.deskHeight,-cfg.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(cfg.deskHeight*2, -cfg.disdanceHalf+canRad)
        pileUpTriangle(4,4, 0,cfg.deskHeight*2,-cfg.disdanceHalf+canRad)
        addDesk(cfg.deskHeight, -cfg.disdanceHalf+canRad+3*canRad)
        pileUpTriangle(3,3, 0,cfg.deskHeight,-cfg.disdanceHalf+canRad+3*canRad)
        addBalls(6)
    })
} //end Levels



function o(x, y){
    x = x || canWidth; y = y || 0;
    return {
          scale:{x:x, y:y},
          position:{  set:function(){}, copy:function(){}  },
          body:{
            position:{  set:function(){}, copy:function(){} },
            syncShapes:function(){} 
          }
        }
}

var GLL = function(){
    this.isMided = false;
    this.position = new THREE.Vector3()
    this.objs = [];
    this.scale = {x:0,y:0,z:0}
}
var G__ = function(){
    this.isMided = false;
    this.position = new THREE.Vector3()
    this.objs = [];
    this.scale = {x:0,y:0,z:0}
}
function ll() {return new GLL();}
function __() {return new G__();}

GLL.prototype.pu = G__.prototype.pu = function(){
    for (var i = 0; i < arguments.length; ++i){
        this.objs.push(arguments[i]);
    }
}
GLL.prototype.end = G__.prototype.end = function(baba){
    baba.objs.push(this)
}
GLL.prototype.movVec3 = G__.prototype.movVec3 = function(vec3){
    this.objs.forEach(item => {
        if (item.objs){//组对象
            item.movVec3(vec3)
        }
        else{
            item.body.position.x += vec3.x ;
            item.body.position.y += vec3.y ;
            item.body.position.z += vec3.z ;
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.copy( item.body.position )
            }
        }
    })
};
GLL.prototype.movX = G__.prototype.movX = function(val){
    this.objs.forEach(item => {
        if (item.objs){//组对象
            item.movX(val)
        }
        else{
            item.body.position.x += val ;
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.copy( item.body.position )
            }
        }
    })
};
GLL.prototype.posLeft = function(x=0, y=0, z=0){
    this.isMided = false;
    this.position.set(x,y,z)

    var topY = y;
    this.objs.forEach(item => {
        if (item.objs){//组对象
            if (item.isMided){
                var vec3 =  {x: x - item.position.x , y: topY - item.position.y, z: z - item.position.z}
                item.movVec3(vec3)
            }else
                item.posLeft(x, topY, z)

        }
        else{
            var posX = x + item.scale.x/2;
            var posY = topY + item.scale.y/2;
            item.body.position.set(posX, posY, z)
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.set(posX, posY, z)
            }
        }
        topY += item.scale.y
        if (this.scale.x < item.scale.x) //找出最宽item
            this.scale.x = item.scale.x;
    });
    this.scale.y = topY - y;
}
G__.prototype.posLeft = function(x=0, y=0, z=0){
    this.isMided = false;
    this.position.set(x,y,z)

    var endX = x;
    this.objs.forEach(item => {
        if (item.objs){//组对象
            if (item.isMided){
                var vec3 =  {x: endX - item.position.x , y: y - item.position.y, z: z - item.position.z}
                item.movVec3(vec3)
            }else
                item.posLeft(endX, y, z)
        }
        else {
            var posX = endX + item.scale.x/2;
            var posY = y + item.scale.y/2;
            item.body.position.set(posX, posY, z)
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.set(posX, posY, z)
            }
        }
        endX += item.scale.x
        if (this.scale.y < item.scale.y) //找出最高item
            this.scale.y = item.scale.y;
    });
    this.scale.x = endX - x;
}
GLL.prototype.posMid = function(){
    if (this.isMided)
        return;
    this.isMided = true;
    this.position.x -= this.scale.x/2
    this.objs.forEach(item => {
        var val = -item.scale.x/2;
        if (item.objs){//组对象
            item.movX(val)
        }
        else {
            item.body.position.x += val
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.x = item.body.position.x
            }
        }
    })
}
G__.prototype.posMid = function(){
    if (this.isMided)
        return;
    this.isMided = true;
    this.position.x -= this.scale.x/2 
    var val = -this.scale.x/2
    this.objs.forEach(item => {
        if (item.objs){//组对象
            item.movX(val)
        }
        else {
            item.body.position.x +=  val;
            // if (item.body.type === 2) //static
            {
                item.body.syncShapes();
                item.position.x = item.body.position.x
            }
        }
    })
}
G__.prototype.pos = GLL.prototype.pos = function(x, y, z){
    this.posLeft(x, y, z);
    this.posMid();
}    


module.exports = CanBallLevels;

    