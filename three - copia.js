import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

// Crear escena
const scene = new THREE.Scene();

// Configurar cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2.8;

// Configurar renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Configurar controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // habilitar el amortiguamiento (suaviza el movimiento de la cámara)
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 4;

// Limitar los ángulos de rotación a 180 grados
controls.minAzimuthAngle = -Math.PI / 2; // -90 grados
controls.maxAzimuthAngle = Math.PI / 2;  // 90 grados
controls.minPolarAngle = 0;              // 0 grados (hacia arriba)
controls.maxPolarAngle = Math.PI;        // 180 grados (hacia abajo)

// Agregar luces
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(0, 200, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.3);
directionalLight.position.set(50, 100, 600);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 180;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.left = -120;
directionalLight.shadow.camera.right = 120;
scene.add(directionalLight);

// Cargar modelo GLB
let action, mixer, clips
const loader = new GLTFLoader();
loader.load(
    './Llibre Portfoli Soufyan Web.glb', // Ruta relativa al archivo GLB
    function (gltf) {

        const model = gltf.scene;
        model.rotation.x = Math.PI / 2; // Rotar 90 grados en el eje X
        model.position.x = -0.5

        // Crear TextureLoader para cargar texturas
        const textureLoader = new THREE.TextureLoader();

        // Cargar texturas
        const baseColorTexture = textureLoader.load('Material Portfolio Tapa Base Color.png');
        const metallicTexture = textureLoader.load('Material Portfolio Tapa Metalic.png');
        const roughnessTexture = textureLoader.load('Material Portfolio Tapa Roughness.png');
        const normalTexture = textureLoader.load('Material Portfolio Tapa Normal.png');
        
        // Aplicar texturas a los materiales del modelo
        model.traverse((child) => {
            if (child.isMesh) {
                console.log(child.name + ' ' + child.isMesh);
                 if(child.isMesh && child.name === 'Cube002'){
                    // Ajustar las propiedades del material para usar las texturas cargadas
                    child.material.map = baseColorTexture;
                    child.material.metalnessMap = metallicTexture;
                    child.material.roughnessMap = roughnessTexture;
                    child.material.normalMap = normalTexture;

                    child.material.map.flipY = false;
                    child.material.roughnessMap.flipY  = false;
                    child.material.metalnessMap.flipY  = false;
                    child.material.normalMap.flipY  = false;

                    child.material.metalness = 1
                    child.material.roughness = 1
                    child.material.normalScale.set(2, 2)

                    // Ajustar otras propiedades según sea necesario
                    child.material.needsUpdate = true;
                 }

                 if(child.isMesh && child.name === 'Pagina'){

                    child.material.metalness = 0
                    child.material.roughness = 0.3

                    // Ajustar otras propiedades según sea necesario
                    child.material.needsUpdate = true;
                 }
            }
        });

        scene.add(model);

        // Ejecutar animaciones en bucle
        mixer = new THREE.AnimationMixer(model);
        clips = gltf.animations;
        console.log("Animaciones encontradas:", gltf.animations);
        const clip = THREE.AnimationClip.findByName(clips, 'ArmatureAction');
        action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(0.01); // La animación va a la mitad de la velocidad normal
        animate.mixers.push(mixer);
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

// Arreglo para almacenar los mixers de animación
animate.mixers = [];
const clock = new THREE.Clock();

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta() * 100;
    animate.mixers.forEach((mixer) => {
        mixer.update(delta);
    });

    controls.update(); // actualizar los controles
    renderer.render(scene, camera);
}

document.addEventListener('click', function (event) {
    console.log("Animación reproducida:");
    action.setLoop(THREE.LoopOnce); // Establece el bucle para que solo se ejecute una vez
    action.clampWhenFinished = true; // Detiene la animación al finalizar
    action.reset().play(); // Inicia la animación
});

animate();
