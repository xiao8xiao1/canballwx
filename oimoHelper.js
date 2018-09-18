// import * as OIMO from './libs/threejs/oimo'
// import * as THREE from './libs/threejs/three'


var OimoHelper = function  (world, scene) {
    // var bodies = [];
    // var meshs = [];
    // this.world = new OIMO.World(o);
    var geos = {};
    var mats = {};
    var materialType = 'MeshPhongMaterial'; //'MeshBasicMaterial';

    geos['sphere'] = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1,16,10));
    geos['box'] = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry(1,1,1));
    geos['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1,1,1));
    mats['sph']    = new THREE[materialType]( {shininess: 10, map: basicTexture(0), name:'sph' } );
    mats['box']    = new THREE[materialType]( {shininess: 10, map: basicTexture(2), name:'box' } );
    mats['cyl']    = new THREE[materialType]( {shininess: 10, map: basicTexture(4), name:'cyl' } );

    this.addBall = function(w, x,y,z, o){
        if (o === undefined)  o={};
        o.type = 'sphere';  o.world=world;
        o.size=[w*0.5]; o.pos=[x,y,z];
        if (o.move === undefined)
            o.move = true;
            
        var b = world.add(o);
        var m = new THREE.Mesh( geos.sphere, mats.sph );
        m.scale.set( w*0.5, w*0.5, w*0.5 );
        m.body = b;  
        b.connectMesh(m);
        scene.add(m)
        return m;
    }

    this.addBox = function(w,h,d, x,y,z, o){
        if (o === undefined)  o={};
        o.type = 'box';  o.world=world;
        o.size=[w,h,d]; o.pos=[x,y,z];

        var b = world.add(o);
        var m = new THREE.Mesh( geos.box, mats.box );
        m.scale.set( w, h, d );
        m.body = b;  
        b.connectMesh(m);
        scene.add(m)
        return m;
    }

    this.addCan = function(w,h, x,y,z, o){
        if (o === undefined)  o={};
        o.type = 'cylinder';  o.world=world;
        o.size=[w*0.5,h]; o.pos=[x,y,z];
        if (o.move === undefined)
            o.move = true;

        var b = world.add(o);
        var m = new THREE.Mesh( geos.cylinder, mats.cyl );
        m.scale.set( w*0.5, h, w*0.5 );
        m.body = b;  
        b.connectMesh(m);
        scene.add(m)
        return m;
    }

    function basicTexture(n){
        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 64;
        var ctx = canvas.getContext( '2d' );
        var color;
        if(n===0) color = "#3884AA";// sphere58AA80
        if(n===1) color = "#61686B";// sphere sleep
        if(n===2) color = "#AA6538";// box
        if(n===3) color = "#61686B";// box sleep
        if(n===4) color = "#AAAA38";// cyl
        if(n===5) color = "#61686B";// cyl sleep
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillRect(32, 32, 32, 32);

        var tx = new THREE.Texture(canvas);
        tx.needsUpdate = true;
        return tx;
    }    
}

module.exports = OimoHelper;
