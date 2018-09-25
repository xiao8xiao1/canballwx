// import * as THREE from './libs/threejs/three'
// import * as SPE from './libs/threejs/SPE'

var Particle = function(scene){
    var explodeGroup,tailGroup;
    var explodeSettings = {
        type: SPE.distributions.SPHERE,
        position: {
            spread: new THREE.Vector3(2),
            radius: 1,
        },
        velocity: {
            value: new THREE.Vector3( 10 )
        },
        size: {
            value: [ 3, 0 ]
        },
        opacity: {
            value: [1, 0]
        },
        color: {
            value: [new THREE.Color('yellow'),new THREE.Color('red')]
        },
        particleCount: 100,
        alive: true,
        duration: 0.05,
        maxAge: {
            value: 0.5
        }
    };
    var tailSettings = new SPE.Emitter({
        // type: SPE.distributions.SPHERE,
        maxAge: {
                value: 0.3
            },
        position: {
            value: new THREE.Vector3(0, 0, 0),
        },
        velocity: {
            value: new THREE.Vector3( 0, 0,  0)
        },
        color: {
            value: [ new THREE.Color('white'), new THREE.Color('red') ]
        },
        size: {
            value: [2,0]
        },
        particleCount: 10,
        direction: 1
        })    
    // Create particle group and emitter
    this.initParticles = function () {
        var texture = THREE.ImageUtils.loadTexture('./images/smokeparticle.png');
        explodeGroup = new SPE.Group({
            texture: {
                value: texture
            },
            // blending: THREE.AdditiveBlending
        });
        explodeGroup.addPool( 10, explodeSettings, false );

        tailGroup = new SPE.Group({
            texture: {
                value: texture
            },
            // blending: THREE.AdditiveBlending
        });
        tailGroup.addPool( 10, tailSettings, false );        
        // Add particle group to scene.
        scene.add( explodeGroup.mesh );
        scene.add( tailGroup.mesh );
    }
    // Trigger an explosion and random co-ords.
    this.createExplosion = function (pos) {
        explodeGroup.triggerPoolEmitter(1, pos);
    }

    this.createTail = function (ball) {
        tailGroup._triggerSingleEmitter(ball.position, ball);
    }    
    this.tick = function (dt){
        explodeGroup.tick( dt );
        tailGroup.tick( dt );
    }
}//end of particle 

module.exports = Particle