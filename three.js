import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";                
import { SkeletonUtils } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

// Crear escena
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xc82b2b );
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
let isAnim = false, mixer,textureLoader, newMixer, clips, firstPage,invertPage,planeActionNew, PortadaAction,parentActionNew;
let IndexPagina = 0, IndexFotos=2;
let pages = [];
var mixers = [];
let model;
let page1;
let page2; 
let checkedPage1 = false, checkedPage2 = false, checkedPortada = false;

const loader = new GLTFLoader();
loader.load(
    './Llibre Portfoli Soufyan Web.glb', // Ruta relativa al archivo GLB
    function (gltf) {

        model = gltf.scene;

        firstPage = gltf.scene.getObjectByName('Pagina__Invert001');
        invertPage = gltf.scene.getObjectByName('Pagina');
        firstPage.visible = false;
        invertPage.visible = false;

        // Crear TextureLoader para cargar texturas
        textureLoader = new THREE.TextureLoader();
            
        for (let i = 0; i < 4; i++) {
            pages[i] = textureLoader.load(`./Pagines/pagina-${(i)}.jpeg`)
        }
        console.log(pages)
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
        PortadaAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'PortadaAction'));
        PortadaAction.setEffectiveTimeScale(0.01); 
        mixers.push(mixer);
    }
);

var hammer = new Hammer(renderer.domElement);

// Configura Hammer.js para detectar eventos de 'pan'
hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

var totalDistance = 0;
var endVelocity = 0;

// Maneja el inicio del movimiento
hammer.on('panstart', function(event) {
    totalDistance = 0; // Resetear la distancia total
    endVelocity = 0; // Resetear la velocidad final
});

hammer.on('panmove', function(event) {
    //console.log('Delta X: ' + event.deltaX)
    let distance = Math.sqrt(Math.pow(event.deltaX, 2))/50;
    totalDistance = distance;

    if(event.deltaX > 1 && !isAnim)
    { 
        let newPage = InstantitzePage('d')
        mixers = mixers.slice(-1);
        mixers.at(0)._actions.forEach(actions => {
            actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
            actions.clampWhenFinished = true; // Detener la animación al finalizar
            actions.time = 0.01
            actions.play(); // Iniciar la animación
        });
        isAnim = true;
        newPage.visible = true;
        console.log('Aqui')
    }
    if(event.deltaX < -0.5 && !isAnim)
    {
        console.log('Esquerra')

        if(IndexPagina === 0){
            [PortadaAction].forEach(action => {
                action.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
                action.clampWhenFinished = true; // Detener la animación al finalizar
                action.play(); // Iniciar la animación
            });
            isAnim = true;
            page1 = InstantitzePage('e');
            page1.visible = true;
        }else if(IndexPagina < 3){
            mixers.at(0)._actions.forEach(actions => {
                actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
                actions.clampWhenFinished = true; // Detener la animación al finalizar
                actions.play(); // Iniciar la animación
            });
            isAnim = true;
        }
        else{
            let newPage = InstantitzePage('e')
            mixers = mixers.slice(-1);
            mixers.at(0)._actions.forEach(actions => {
                actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
                actions.clampWhenFinished = true; // Detener la animación al finalizar
                actions.time = 0.01
                actions.play(); // Iniciar la animación
            });
            isAnim = true;
            newPage.visible = true;
            console.log('Aqui')
        }

        continueAnimation((totalDistance * 10))
    }
});

function continueAnimation(velocity) {
        requestAnimationFrame(function() {
            continueAnimation(velocity);
        });

        const deltaTime = (velocity * 0.016) * 10;
        if(mixers.at(0)){
            mixers.at(0).update(deltaTime);
        }
}

function finish(e) {
        //console.log('Finish')
        console.log(e)
        if(e.action._clip.name === 'PortadaAction' ){
            IndexPagina++
            console.log('Índice actual:', IndexPagina);
            mixers.shift();
        }
        if(e.action._clip.name === 'PlaneAction'){
            console.log('Índice actual:', IndexPagina);
            mixers.shift();
        }
        
        if((e.action._clip.name === 'PlaneAction' || e.action._clip.name === 'PlaneActionInvert') && IndexPagina > 3){
            scene.remove(e.target._root)
        }
        console.log(mixers)
        isAnim = false;
        totalDistance = 0; // Resetear la distancia total
        endVelocity = 0; // Resetear la velocidad final
}

function updatePageMaterial(page, textureFront, textureBack) {
    page.material = page.material.clone();
    page.material.side = THREE.DoubleSide;
    page.material.onBeforeCompile = function (shader) {
        shader.uniforms.textureFront = { value: textureFront };
        shader.uniforms.textureBack = { value: textureBack };

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_pars_fragment>',
            `
            uniform sampler2D textureFront;
            uniform sampler2D textureBack;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            vec4 frontColor = texture2D(textureFront, vUv);
            vec4 backColor = texture2D(textureBack, vUv);
            diffuseColor = gl_FrontFacing ? frontColor : backColor;
            `
        );
    };
    page.material.needsUpdate = true;
}

function InstantitzePage(side){
    let newPage = SkeletonUtils.clone(firstPage);
    console.log('Creant Pagina')
    newPage.material = newPage.material.clone();


    
    let textureFront;
    let textureBack;

    // Pagines Textures
    if(side == 'e'){
        textureFront = pages[(IndexFotos%4)];
        textureBack = pages[((IndexFotos+1)%4)];
    }else{
        textureFront = pages[((IndexFotos-1)%4)];
        textureBack = pages[((IndexFotos)%4)];
    }

    newPage.material.side = THREE.DoubleSide;
    newPage.material.onBeforeCompile = function (shader) {
        shader.uniforms.textureFront = { value: textureFront };
        shader.uniforms.textureBack = { value: textureBack };

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_pars_fragment>',
            `
            uniform sampler2D textureFront;
            uniform sampler2D textureBack;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            vec4 frontColor = texture2D(textureFront, vUv);
            vec4 backColor = texture2D(textureBack, vUv);
            diffuseColor = gl_FrontFacing ? frontColor : backColor;
            `
        );
    };

    newPage.material.needsUpdate = true;
     // Pagines Textures
     if(side == 'e'){
        IndexFotos += 2
    }else{
        IndexFotos -= 2
    }
    newMixer = new THREE.AnimationMixer(newPage);
   
    if(side == 'e'){
        planeActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'KeyAction.002'));
        parentActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'PlaneAction'));
        planeActionNew.setEffectiveTimeScale(0.01); 
        parentActionNew.setEffectiveTimeScale(0.01); 
    }else{
        planeActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'KeyAction.001'));
        parentActionNew = newMixer.clipAction(THREE.AnimationClip.findByName(clips, 'PlaneActionInvert'));
        planeActionNew.setEffectiveTimeScale(0.01); 
        parentActionNew.setEffectiveTimeScale(0.01); 
    }

    mixers.push(newMixer);
    newMixer.addEventListener('finished',finish);

    [planeActionNew, parentActionNew].forEach(actions => {
        actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
        actions.clampWhenFinished = true; // Detener la animación al finalizar
    });
    
    newMixer.setTime(0);
    scene.add(newPage);
    IndexPagina++
    return newPage
    //console.log(scene);
}

function CheckImage(){
    let planeAction = mixers.at(0)?._actions.find(action => action._clip.name === "PlaneAction");
    let planeActionInvert = mixers.at(0)?._actions.find(action => action._clip.name === "PlaneActionInvert");
    //let PortadaAction = mixers.at(0)?._actions.find(action => action._clip.name === "PortadaAction");
    
    if(planeAction && IndexPagina == 2 && !checkedPortada){
        if(planeAction.time > 0.1){
            page2 = InstantitzePage('e');
            page2.visible = true;
            checkedPortada = true;
        }
    }
    if (planeAction && IndexPagina > 4) {
        if(planeAction.time > 0.5 && !checkedPage1){
            console.log('Check Inici Animacio Dreta');
            //Aqui ha de canviar el material del color del de la deta per el seguent
            checkedPage1 = true;

            // Pagines Textures
            const textureFront = pages[((IndexFotos+4)%4)];
            const textureBack = pages[((IndexFotos+5)%4)];
        
            updatePageMaterial(page2, textureFront, textureBack);
        }
        if(planeAction.time > 4 && checkedPage1){
            checkedPage1 = false;

            // Pagines Textures
            const textureFront1 = pages[((IndexFotos-2)%4)];
            const textureBack1 = pages[((IndexFotos-1)%4)];
            updatePageMaterial(page1, textureFront1, textureBack1);
        }

    } else if (planeActionInvert && IndexPagina > 2) {
        if(planeActionInvert.time > 0.5 && !checkedPage2){
            console.log('Check Inici Animacio Esquerra');
            checkedPage2 = true;      
            // Pagines Textures
            const textureFront = pages[((IndexFotos+2)%4)];
            const textureBack = pages[((IndexFotos)%4)];
        
            updatePageMaterial(page1, textureFront, textureBack);
        }
        if(planeActionInvert.time > 4 && checkedPage2){
            console.log('Check Final Animacio Esquerra');
            checkedPage2 = false;

            // Pagines Textures
            const textureFront1 = pages[((IndexFotos-2)%4)];
            const textureBack1 = pages[((IndexFotos-1)%4)];
            updatePageMaterial(page2, textureFront1, textureBack1);
        }
    }
}

function animate() {
    CheckImage();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Iniciar la animación
animate();
