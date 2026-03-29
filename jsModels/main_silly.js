import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

// --- CARGADOR DE TEXTURA ---
const textureLoader = new THREE.TextureLoader();
const textureZZZ = textureLoader.load('../textures/ZZZ.png');
textureZZZ.wrapS = textureZZZ.wrapT = THREE.RepeatWrapping;
textureZZZ.repeat.set(4, 4); // Patrón más denso para el efecto neón

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    // --- LUZ SUPERIOR ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(0, 500, 100);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2)); // Luz ambiental baja para resaltar el emissive

    const grid = new THREE.GridHelper(2000, 20, 0x00ffcc, 0x003322); // Rejilla Neón
    scene.add(grid);

    const loader = new FBXLoader();
    // Cargamos Silly Dancing.fbx
    loader.load('../examples/models/fbx/practica3_2/Silly Dancing.fbx', function (object) {
        
        mixer = new THREE.AnimationMixer(object);
        if (object.animations.length > 0) {
            mixer.clipAction(object.animations[0]).play();
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                // EFECTO NEÓN / EMISIVO
                child.material = new THREE.MeshPhongMaterial({
                    map: textureZZZ,
                    color: 0x000000,      // Base oscura para que el emissive destaque
                    emissive: 0x00ffcc,   // Color de la "luz" propia
                    emissiveIntensity: 0.6,
                    shininess: 150,
                    specular: 0x00ffcc
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

// Escuchador de mensajes del index.html
window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_COLOR') {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                // Cambia tanto el color base como el resplandor neón
                child.material.color.set(event.data.color);
                child.material.emissive.set(event.data.color);
            }
        });
    }
});