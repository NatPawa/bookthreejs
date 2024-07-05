import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";                
import { SkeletonUtils } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

// Crear escena
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x0d0e0f );
// Configurar cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 2.8;
camera.rotation.x = 180.65;

// Configurar renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Agregar luces
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(0, 200, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.2);
directionalLight.position.set(0, 600, 40);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 180;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.left = -120;
directionalLight.shadow.camera.right = 120;
scene.add(directionalLight);


const directionalLight1 = new THREE.DirectionalLight(0xffffff,0.2);
directionalLight1.position.set(500, 600, -40);
directionalLight1.castShadow = true;
directionalLight1.shadow.camera.top = 180;
directionalLight1.shadow.camera.bottom = -100;
directionalLight1.shadow.camera.left = -120;
directionalLight1.shadow.camera.right = 120;
scene.add(directionalLight1);

// Cargar modelo GLB
let mixer,textureLoader, newMixer, clips, firstPage, planeAction,planeActionNew, emptyAction,KeyActionNew,emptyActionNew, parentAction,parentActionNew;
let IndexPagina = 0;
let pages = [];


const loader = new GLTFLoader();
loader.load(
    './Llibre Portfoli Soufyan Web.glb', // Ruta relativa al archivo GLB
    function (gltf) {
        const model = gltf.scene;

        firstPage = gltf.scene.getObjectByName('Parent');
        pages.push(firstPage);
        // Crear TextureLoader para cargar texturas
        textureLoader = new THREE.TextureLoader();
    

        // Tapa Textures
        const baseColorTexture = textureLoader.load('Material Portfolio Tapa Base Color.png');
        const metallicTexture = textureLoader.load('Material Portfolio Tapa Metalic.png');
        const roughnessTexture = textureLoader.load('Material Portfolio Tapa Roughness.png');
        const normalTexture = textureLoader.load('Material Portfolio Tapa Normal.png');

        // Aplicar texturas a los materiales del modelo
        model.traverse((child) => {
            console.log(child.name)
            if (child.isMesh) {
                console.log(child.name + ' ' + child.isMesh);
                if (child.isMesh && child.name === 'Cube002') {
                    // Ajustar las propiedades del material para usar las texturas cargadas
                    child.material.map = baseColorTexture;
                    child.material.metalnessMap = metallicTexture;
                    child.material.roughnessMap = roughnessTexture;
                    child.material.normalMap = normalTexture;

                    child.material.map.flipY = false;
                    child.material.roughnessMap.flipY = false;
                    child.material.metalnessMap.flipY = false;
                    child.material.normalMap.flipY = false;

                    child.material.metalness = 1;
                    child.material.roughness = 1;
                    child.material.normalScale.set(2, 2);

                    // Ajustar otras propiedades según sea necesario
                    child.material.needsUpdate = true;
                }

                if (child.isMesh && child.name === 'Pagina') {
                    child.material.metalness = 0;
                    child.material.roughness = 0.3;

                    // Ajustar otras propiedades según sea necesario
                    child.material.needsUpdate = true;
                }
            }
        });

        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        
        mixer.addEventListener('finished',finish);

         
        clips = gltf.animations;
        console.log("Animaciones encontradas:", gltf.animations);

        // Crear acciones para las animaciones
        planeAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'KeyAction'));
        emptyAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'ArmatureAction'));
        parentAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'ParentAction'));
        planeAction.setEffectiveTimeScale(0.01); 
        emptyAction.setEffectiveTimeScale(0.01); 
        parentAction.setEffectiveTimeScale(0.01); 
        animate.mixers.push(mixer);
    }
);

// Arreglo para almacenar los mixers de animación
animate.mixers = [];


 
renderer.domElement.addEventListener('mousedown', function(event) {
    if(IndexPagina === 0){
        [planeAction,emptyAction, parentAction].forEach(action => {
            action.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
            action.clampWhenFinished = true; // Detener la animación al finalizar
            action.play(); // Iniciar la animación
        });
    }else{
        [parentActionNew,emptyActionNew,KeyActionNew].forEach(actions => {
            actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
            actions.clampWhenFinished = true; // Detener la animación al finalizar
            actions.play(); // Iniciar la animación
        });
    }
 
});

var hammer = new Hammer(renderer.domElement);

// Configura Hammer.js para detectar eventos de 'pan'
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

var totalDistance = 0;
var endVelocity = 0;

// Maneja el inicio del movimiento
hammer.on('panstart', function(event) {
    initialTime = planeAction.time; // Guardar el tiempo inicial de la animación
    totalDistance = 0; // Resetear la distancia total
    endVelocity = 0; // Resetear la velocidad final
});

hammer.on('panmove', function(event) {
    //console.log('Delta X: ' + event.deltaX)
    const distance = Math.sqrt(Math.pow(event.deltaX, 2))/100;
    totalDistance += distance;

    animate.mixers.at(-1).update(distance);
});

// Maneja el final del movimiento
hammer.on('panend', function(event) {
    console.log(`Pan terminado. Distancia total recorrida: ${totalDistance.toFixed(2)} px. Velocidad final: ${event.velocityX.toFixed(2)} px/s.`);
    endVelocity = Math.abs(event.velocityX);
    // Asegurarse de que la velocidad no sea igual a cero
    if (endVelocity < 0.1) {
        endVelocity = 1; // Valor mínimo para la velocidad
        console.log("Demasiado lento, modificamos la velocidad")
    }
    if(IndexPagina === 0){
        continueAnimation(endVelocity);
    }else{
        continueAnimationNew(endVelocity);
    }
});

function continueAnimation(velocity) {
    console.log('continueAnimation')
    if (planeAction.time < planeAction.getClip().duration) {
        // Continuar actualizando el mezclador hasta que la animación se haya completado
        requestAnimationFrame(function() {
            continueAnimation(velocity);
        });

        if(planeAction.time<1 && pages.length === 1){
            console.log('crear pagina')
            InstantitzePage()
        }
        // Calcular deltaTime basado en la velocidad
        const deltaTime = (velocity * 0.016) * 150; // 0.016 es aproximadamente un frame a 60fps
        console.log(' pages.length ' + pages.length)
        //console.log('Time: ' + planeAction.time)
        mixer.update(deltaTime);
    }
}

function finish(e) {
        console.log(e.action._clip.name)
        if(e.action._clip.name === 'ParentAction'){
            IndexPagina++;
            console.log('Índice actual:', IndexPagina);
        }
        
}

function InstantitzePage(){

    let newPage = SkeletonUtils.clone(firstPage);
    newPage.children[1].material = newPage.children[1].material.clone()


    // Pagines Textures
    const PaginaColorTexture = textureLoader.load(`./Pagines/pagina-${3}.jpeg`);
    newPage.children[1].material.map = PaginaColorTexture
    newMixer = new THREE.AnimationMixer(newPage);
    parentActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'KeyAction'));
    planeActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'EmptyAction'));
    emptyActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'ParentAction'));
    KeyActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'PlaneAction'));
    
    parentActionNew.setEffectiveTimeScale(0.01); 
    planeActionNew.setEffectiveTimeScale(0.01); 
    emptyActionNew.setEffectiveTimeScale(0.01); 
    KeyActionNew.setEffectiveTimeScale(0.01); 
    
    animate.mixers.push(newMixer);
    newMixer.addEventListener('finished',finish);

    pages.push(newPage);
    scene.add(newPage);
    console.log(pages);
}

function continueAnimationNew(velocity) {
    console.log('continueAnimationNew')
    console.log(animate.mixers.at(-1)._actions[1])
    if (animate.mixers.at(-1)._actions[1].time < animate.mixers.at(-1)._actions[1].getClip().duration && IndexPagina >=1) {
        // Continuar actualizando el mezclador hasta que la animación se haya completado
        requestAnimationFrame(function() {
            continueAnimationNew(velocity);
        });
        
        console.log(animate.mixers.at(-1)._actions[1].time)
        if(animate.mixers.at(-1)._actions[1].time<1 && (pages.length-2) < IndexPagina){
            console.log('crear pagina')
            InstantitzePage()
        }
        // Calcular deltaTime basado en la velocidad
        const deltaTime = (velocity * 0.016) * 150; // 0.016 es aproximadamente un frame a 60fps
        //console.log('Delta time continue: ' + deltaTime)
        //console.log('Plane Action Duration: ' +  planeActionNew.getClip().duration)
        //console.log('planeActionNew time: ' + planeActionNew.time)
        animate.mixers[IndexPagina].update(deltaTime);
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Iniciar la animación
animate();
