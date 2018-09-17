import * as OIMO from './libs/threejs/oimo'
var CanBallLevels = function(c, hp, ballControls, world){
    var levelFuncs = [];    
    
    var canWidth = 2*c.canRad,
        canRad = c.canRad,
        canHeight = c.canHeight,
        ballRad = c.ballRad,
        ballWidth = 2*c.ballRad;
    this.setPara = function(c){
        canWidth = 2*c.canRad
        canRad = c.canRad
        canHeight = c.canHeight
        ballRad = c.ballRad
        ballWidth = 2*c.ballRad
    }
    this.nearestZ = -c.disdanceHalf
    var _this = this;

    this.getCnt= function(){
        return levelFuncs.length;
    }
    this.go = function(index){
        this.nTarget = 0
        if (index < levelFuncs.length)
            levelFuncs[index]();
    }
    function addDesk(h, zPos){
        var desk = hp.addBox(c.roomWidth,h,canRad*2,  0, h/2, zPos);
        ballControls.arrTarget.push(desk);
    }
    function addBox(w, h, xPos,yPos,zPos, o){
        var desk = hp.addBox(w, h, canRad*2,  xPos, yPos+h/2, zPos, o)
        ballControls.arrTarget.push(desk);
        return desk;
    }
    function addCan(xPos,yPos,zPos,o)
    {
        var can = hp.addCan(canWidth,canHeight,  xPos,yPos+canHeight/2,zPos,o)
        ballControls.arrTarget.push(can); 
        _this.nTarget++;
        if (zPos + canRad > _this.nearestZ)  _this.nearestZ = zPos + canRad;
        return can;
    }
    function addBall(xPos, o)
    {
        var ball = hp.addBall(ballWidth, xPos, c.groundY+ballRad , c.disdanceHalf, o)
        ballControls.arrBall.push(ball);
    }
    function addBalls(cnt){
        if (cnt === undefined)
            cnt = Math.floor(c.roomWidth/(2*ballRad))
        var startX = -(cnt*ballRad) + ballRad;
        for (var i = 0; i < cnt; ++i)
            addBall(startX + i* 2*ballRad)
    }   
    function addSwingBox(w, h, xPos,yPos,zPos){
        var desk = addBox(w, h, xPos,yPos,zPos, {move:true})
        var ball = hp.addBall(ballWidth, xPos, yPos+h+ballRad+w/2, zPos, {move:false})
        ballControls.arrTarget.push(ball);
        var spring = [2, 0.3];
        world.add({ type:'jointHinge', body1:ball.body, body2:desk.body, pos1:[0, -ballRad-w/2, 0], pos2:[0, h/2, 0],
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
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad, yPos=0;
        addDesk(c.deskHight, zPos); 
        yPos+=c.deskHight;
        addCan(0,yPos,zPos)
        addBall(0)
    })    
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad, yPos=0;
        addDesk(c.deskHight, zPos); yPos+=c.deskHight;
        pileUpTriangle(4,3,  0,yPos,zPos)
        addBalls(3)
    })    
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad, yPos=0;
        addDesk(c.deskHight, zPos); yPos+=c.deskHight;
        pileUpTriangle(5,4,  0,yPos,zPos)
        addBalls(3)
    })        
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad, yPos=0;
        addDesk(c.deskHight, zPos); yPos+=c.deskHight;
        pileUp111(0, yPos,zPos, 0)
        pileUp111(-canWidth-canRad, yPos,zPos, -0.8*canRad)
        pileUp111( canWidth+canRad, yPos,zPos,  0.8*canRad)
        addBalls(3)
    })
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad, yPos=0;
        addDesk(c.deskHight, zPos); yPos+=c.deskHight;
        pileUp221(0, yPos,zPos)
        addBalls(3)
    })
    levelFuncs.push(function()
    {
        var zPos = -c.disdanceHalf+canRad;
        addDesk(c.deskHight, zPos)
        var l, r, h;
        [l,r,h]  = pileUpTBox(0,c.deskHight,zPos)
        addCan(l, h, zPos)
        addCan(r, h, zPos)
        addBalls(6)
        addSwingBox(canRad*2, canHeight*2,  0,c.deskHight, zPos+canRad*4)   
    })
    levelFuncs.push(function()
    {
        addDesk(c.deskHight, -c.disdanceHalf+canRad)
        pileUp111( 0,       c.deskHight,-c.disdanceHalf+canRad)
        pileUp111( 4*canRad,c.deskHight,-c.disdanceHalf+canRad )
        // pileUp111(-4*canRad,c.deskHight,-c.disdanceHalf+canRad )
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(c.deskHight, -c.disdanceHalf+canRad)
        pileUpLine(3, 0,c.deskHight,-c.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(c.deskHight, -c.disdanceHalf+canRad)
        pileUp121(0,c.deskHight,-c.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(c.deskHight, -c.disdanceHalf+canRad)
        pileUpTriangle(3,3, 0,c.deskHight,-c.disdanceHalf+canRad)
        addBalls(6)
    })
    levelFuncs.push(function()
    {
        addDesk(c.deskHight*2, -c.disdanceHalf+canRad)
        pileUpTriangle(4,4, 0,c.deskHight*2,-c.disdanceHalf+canRad)
        addDesk(c.deskHight, -c.disdanceHalf+canRad+3*canRad)
        pileUpTriangle(3,3, 0,c.deskHight,-c.disdanceHalf+canRad+3*canRad)
        addBalls(6)
    })
} //end Levels

module.exports = CanBallLevels;

    