import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

// --- CARGADOR DE TEXTURA ---
const textureLoader = new THREE.TextureLoader();
const textureComex = textureLoader.load('../textures/Comex.png');
textureComex.wrapS = textureComex.wrapT = THREE.RepeatWrapping;
textureComex.repeat.set(3, 3); // Repetimos más veces el logo

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // --- LUZ SUPERIOR ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(0, 500, 100);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const grid = new THREE.GridHelper(2000, 20, 0x444444, 0x222222);
    scene.add(grid);

    const loader = new FBXLoader();
    // Cargamos Flair.fbx
    loader.load('../examples/models/fbx/practica3_2/Flair.fbx', function (object) {
        
        mixer = new THREE.AnimationMixer(object);
        if (object.animations.length > 0) {
            mixer.clipAction(object.animations[0]).play();
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                // EFECTO PLÁSTICO BRILLANTE
                child.material = new THREE.MeshPhongMaterial({
                    map: textureComex,
                    color: 0x00d1b2,     // Color Aqua Comex
                    shininess: 100,      // Brillo pulido
                    specular: 0x444444   // Reflejo grisáceo para no saturar
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(() => {
        if (mixer) mixer.update(clock.getDelta());
        renderer.render(scene, camera);
    });
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Escuchador de color para el menú
window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_COLOR') {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.set(event.data.color);
            }
        });
    }
});