import * as THREE from './libs/threejs/three'
import * as SPE from './libs/threejs/SPE'

var Particle = function(){
    var emitter, particleGroup,
    emitterSettings = {
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
    // Create particle group and emitter
    this.initParticles = function () {
        particleGroup = new SPE.Group({
            texture: {
                value: THREE.ImageUtils.loadTexture('images/smokeparticle.png')
            },
            // blending: THREE.AdditiveBlending
        });
        particleGroup.addPool( 10, emitterSettings, false );
        // Add particle group to scene.
        // scene.add( particleGroup.mesh );
        return particleGroup.mesh;
    }
    // Trigger an explosion and random co-ords.
    this.createExplosion = function (pos) {
        var num = 150;
        particleGroup.triggerPoolEmitter(1, pos);
    }
    this.tick = function (dt){
        particleGroup.tick( dt );
    }
}//end of particle 

module.exports = Particle