import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

// --- CONFIGURACIÓN DE TEXTURA NUEVA ---
const textureLoader = new THREE.TextureLoader();
// Cargamos la nueva textura 'Acheron.png'
const textureAcheron = textureLoader.load('../textures/Acheron.png');

// Configuramos para que la textura se repita y no se vea estirada
textureAcheron.wrapS = textureAcheron.wrapT = THREE.RepeatWrapping;
textureAcheron.repeat.set(2, 2); // Ajusta este número (ej. 4,4) para hacer el patrón más pequeño

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // Fondo casi negro para resaltar el brillo

    // --- ILUMINACIÓN SUPERIOR (Requisito ITP) ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 5); // Luz muy potente
    dirLight.position.set(0, 500, 100); // Desde arriba y un poco al frente
    dirLight.castShadow = true;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiental suave
    scene.add(ambientLight);

    // Rejilla de suelo
    const grid = new THREE.GridHelper(2000, 20, 0x333333, 0x111111);
    scene.add(grid);

    // --- CARGA DEL MODELO FBX ---
    const loader = new FBXLoader();
    loader.load('../examples/models/fbx/practica3_2/Dancing Twerk.fbx', function (object) {
        
        mixer = new THREE.AnimationMixer(object);
        if (object.animations.length > 0) {
            const action = mixer.clipAction(object.animations[0]);
            action.play();
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                // APLICACIÓN DE MATERIAL, TEXTURA Y EFECTO BRILLANTE
                child.material = new THREE.MeshPhongMaterial({
                    map: textureAcheron,     // <--- Aquí asignamos la textura
                    color: 0xffffff,        // Blanco para que no altere los colores de la imagen
                    shininess: 250,         // Brillo especular muy alto (efecto metal)
                    specular: 0xffffff,      // Reflejo blanco puro
                    reflectivity: 1
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(object);
    });

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // Controles de cámara
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

// --- ESCUCHADOR PARA CAMBIO DE COLOR DESDE EL INDEX (Opcional) ---
window.addEventListener('message', (event) => {
    if (event.data.type === 'CHANGE_COLOR') {
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                // Esto cambiará el tinte sobre la textura
                child.material.color.set(event.data.color);
            }
        });
    }
});