import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

// --- CARGADOR DE TEXTURA ---
const textureLoader = new THREE.TextureLoader();
const texturePachuca = textureLoader.load('../textures/PachucaFC.png');
texturePachuca.wrapS = texturePachuca.wrapT = THREE.RepeatWrapping;
texturePachuca.repeat.set(2.5, 2.5); // Escala para que el escudo se vea repetido

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

    const grid = new THREE.GridHelper(2000, 20, 0x003399, 0x001144); // Rejilla en tonos azules
    scene.add(grid);

    const loader = new FBXLoader();
    // Cargamos Samba Dancing.fbx
    loader.load('../examples/models/fbx/practica3_2/Samba Dancing.fbx', function (object) {
        
        mixer = new THREE.AnimationMixer(object);
        if (object.animations.length > 0) {
            mixer.clipAction(object.animations[0]).play();
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                // EFECTO METÁLICO DEPORTIVO
                child.material = new THREE.MeshPhongMaterial({
                    map: texturePachuca,
                    color: 0x004da8,     // Azul Rey Pachuca
                    shininess: 200,      // Brillo tipo metal pulido
                    specular: 0xffffff   // Reflejo blanco nítido
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

// Escuchador para interactuar con el colorPicker del index
window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_COLOR') {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.set(event.data.color);
            }
        });
    }
});