import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let camera, scene, renderer, mixer;
const clock = new THREE.Clock();

init();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // --- LUZ SUPERIOR (Requisito ITP) ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(0, 500, 100);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const grid = new THREE.GridHelper(2000, 20, 0x888888, 0x444444);
    scene.add(grid);

    // --- CARGADOR DE ELMO ---
    const loader = new FBXLoader();
    // Asegúrate de que el nombre coincida: Elmo.fbx
    loader.load('../examples/models/fbx/practica3_2/Elmo.fbx', function (object) {
        
        mixer = new THREE.AnimationMixer(object);
        
        // Verificamos si tiene animaciones antes de reproducir
        if (object.animations.length > 0) {
            const action = mixer.clipAction(object.animations[0]);
            action.play();
        }

        object.traverse(function (child) {
            if (child.isMesh) {
                // MATERIAL ROJO BRILLANTE PARA ELMO
                child.material = new THREE.MeshPhongMaterial({
                    color: 0xff0000,     // Rojo Elmo
                    shininess: 150,      // Mucho brillo
                    specular: 0xffffff   // Reflejo blanco puro
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Escalar si Elmo sale muy pequeño o muy grande desde Blender
        // object.scale.set(1, 1, 1); 

        scene.add(object);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
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