import './style.css'
import * as THREE from 'three'

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

// Renderer setup
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Game state
let score = 0;
let bird = null;
let people = [];
let poopParticles = [];
let buildings = [];
let ground = null;

// Bird class
class Bird {
    constructor() {
        // Create bird geometry (simple bird shape)
        const birdGeometry = new THREE.Group();
        
        // Bird body
        const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        birdGeometry.add(body);
        
        // Bird head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.6, 0.8, 0);
        birdGeometry.add(head);
        
        // Bird beak
        const beakGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.rotation.z = Math.PI / 2;
        beak.position.set(1.1, 0.8, 0);
        birdGeometry.add(beak);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.4);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(0, 0.5, 0.6);
        birdGeometry.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0, 0.5, -0.6);
        birdGeometry.add(rightWing);
        
        this.mesh = birdGeometry;
        this.mesh.position.set(0, 15, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Bird physics
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 0.3;
        this.rotationSpeed = 0.05;
        
        scene.add(this.mesh);
    }
    
    update(deltaTime) {
        // Handle input
        if (keys.w || keys.ArrowUp) {
            this.velocity.y = this.speed;
        } else if (keys.s || keys.ArrowDown) {
            this.velocity.y = -this.speed;
        } else {
            this.velocity.y *= 0.9;
        }
        
        if (keys.a || keys.ArrowLeft) {
            this.velocity.x = -this.speed;
            this.mesh.rotation.y = Math.PI / 2;
        } else if (keys.d || keys.ArrowRight) {
            this.velocity.x = this.speed;
            this.mesh.rotation.y = -Math.PI / 2;
        } else {
            this.velocity.x *= 0.9;
            this.mesh.rotation.y *= 0.9;
        }
        
        // Update position
        this.mesh.position.add(this.velocity);
        
        // Keep bird in bounds
        this.mesh.position.x = Math.max(-20, Math.min(20, this.mesh.position.x));
        this.mesh.position.y = Math.max(5, Math.min(25, this.mesh.position.y));
        this.mesh.position.z = Math.max(-20, Math.min(20, this.mesh.position.z));
        
        // Update camera to follow bird
        camera.position.lerp(new THREE.Vector3(
            this.mesh.position.x,
            this.mesh.position.y + 5,
            this.mesh.position.z + 15
        ), 0.05);
        camera.lookAt(this.mesh.position);
    }
    
    poop() {
        const poopGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const poopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const poop = new THREE.Mesh(poopGeometry, poopMaterial);
        
        poop.position.copy(this.mesh.position);
        poop.position.y -= 0.5;
        poop.castShadow = true;
        
        const poopParticle = {
            mesh: poop,
            velocity: new THREE.Vector3(0, -0.5, 0),
            active: true
        };
        
        poopParticles.push(poopParticle);
        scene.add(poop);
    }
}

// Person class
class Person {
    constructor(x, z) {
        const personGeometry = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        personGeometry.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.9;
        personGeometry.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(0.3, 0.4, 0);
        leftArm.rotation.z = Math.PI / 4;
        personGeometry.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(-0.3, 0.4, 0);
        rightArm.rotation.z = -Math.PI / 4;
        personGeometry.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.15, -0.1, 0);
        personGeometry.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.15, -0.1, 0);
        personGeometry.add(rightLeg);
        
        this.mesh = personGeometry;
        this.mesh.position.set(x, 0.5, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Movement
        this.startX = x;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.speed = 0.02 + Math.random() * 0.03;
        this.walkDistance = 5 + Math.random() * 10;
        this.currentDistance = 0;
        
        scene.add(this.mesh);
    }
    
    update() {
        this.currentDistance += this.speed * this.direction;
        
        if (Math.abs(this.currentDistance) > this.walkDistance) {
            this.direction *= -1;
        }
        
        this.mesh.position.x = this.startX + this.currentDistance;
        
        // Simple walking animation
        this.mesh.rotation.y = Math.sin(Date.now() * 0.01) * 0.1;
    }
    
    hitByPoop() {
        // Change color to indicate being hit
        this.mesh.children.forEach(child => {
            if (child.material) {
                child.material.color.setHex(0x8B4513);
            }
        });
        
        score += 10;
        document.getElementById('score').textContent = score;
    }
}

// Building class
class Building {
    constructor(x, z, width, height, depth) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.3, 0.5 + Math.random() * 0.3)
        });
        
        this.mesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        this.mesh.position.set(x, height / 2, z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);
    }
}

// Input handling
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    space: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Mouse/click handling for pooping
window.addEventListener('click', () => {
    if (bird) {
        bird.poop();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (bird) {
            bird.poop();
        }
    }
});

// Create ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Create buildings
for (let i = 0; i < 20; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    const width = 2 + Math.random() * 4;
    const height = 3 + Math.random() * 8;
    const depth = 2 + Math.random() * 4;
    
    const building = new Building(x, z, width, height, depth);
    buildings.push(building);
}

// Create people
for (let i = 0; i < 15; i++) {
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    const person = new Person(x, z);
    people.push(person);
}

// Create bird
bird = new Bird();

// Animation loop
const clock = new THREE.Clock();

function animate() {
    const deltaTime = clock.getDelta();
    
    // Update bird
    if (bird) {
        bird.update(deltaTime);
    }
    
    // Update people
    people.forEach(person => person.update());
    
    // Update poop particles
    poopParticles.forEach((poopParticle, index) => {
        if (poopParticle.active) {
            poopParticle.mesh.position.add(poopParticle.velocity);
            
            // Check if poop hit ground
            if (poopParticle.mesh.position.y <= 0.1) {
                poopParticle.active = false;
                scene.remove(poopParticle.mesh);
                poopParticles.splice(index, 1);
            }
            
            // Check collision with people
            people.forEach(person => {
                const distance = poopParticle.mesh.position.distanceTo(person.mesh.position);
                if (distance < 0.5 && poopParticle.active) {
                    person.hitByPoop();
                    poopParticle.active = false;
                    scene.remove(poopParticle.mesh);
                    poopParticles.splice(index, 1);
                }
            });
        }
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
animate();