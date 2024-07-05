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
let mixer,textureLoader, newMixer, clips, firstPage, planeAction,planeActionNew, emptyAction,KeyActionNew,emptyActionNew, parentAction,parentActionNew;
let IndexPagina = 0;
let pages = [];
let ids = [];

const loader = new GLTFLoader();
loader.load(
    './Llibre Portfoli Soufyan Web.glb', // Ruta relativa al archivo GLB
    function (gltf) {
        const model = gltf.scene;

        firstPage = gltf.scene.getObjectByName('Parent');
        pages.push(firstPage);
        configurarMateriales(model);
        configurarAnimaciones(model,gltf);
        scene.add(model);
    }
);

animate.mixers = [];

var hammer = new Hammer(renderer.domElement);

hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

var totalDistance = 0;
var endVelocity = 0;
var velocitatGeneral = 0;
var indexImagen = 0;
var mousedown = false;

renderer.domElement.addEventListener('mousedown', function(event) {
    mousedown = true;
    CheckInstance()
});

renderer.domElement.addEventListener('mouseup', function(event) {
    mousedown = false;
    CheckInstance()
});

hammer.on('panstart', function(event) {
    //console.log(animate.mixers[IndexPagina]._actions[1]);
    totalDistance = 0; // Resetear la distancia total
    endVelocity = 0; // Resetear la velocidad final
});

hammer.on('panmove', function(event) {
    console.log(IndexPagina)
    //console.log('Delta X: ' + event.deltaX)
    const distance = (event.deltaX / 100) * -1;
    totalDistance = distance;
    //console.log('Pages length: ' + pages.length)
    //console.log('IndexPagina: ' + (IndexPagina+1))
    //console.log(IndexPagina);
    if(totalDistance >= 0){
        velocitatGeneral = 1
    }else{
        velocitatGeneral = -1
    }
    if(animate.mixers[IndexPagina]._actions[0].time == 0){
        animate.mixers[IndexPagina]._actions.forEach(actions => {
            actions.reset().play(); // Iniciar la animación
        });
    }
    
    //console.log('Distance:' + distance)
    CheckInstance()
    animate.mixers[IndexPagina].update(distance);
});

// Maneja el final del movimiento
hammer.on('panend', function(event) {
    //console.log(`Pan terminado. Distancia total recorrida: ${totalDistance.toFixed(2)} px. Velocidad final: ${event.velocityX.toFixed(2)} px/s.`);
    endVelocity = Math.abs(event.velocityX);
    // Asegurarse de que la velocidad no sea igual a cero
    if (endVelocity < 0.4) {
        endVelocity = 1; // Valor mínimo para la velocidad
        console.log("Demasiado lento, modificamos la velocidad")
    }
    CheckInstance()
    continueAnimation(endVelocity);
});

function continueAnimation(velocity) {
    //console.log(animate.mixers[IndexPagina]._actions[2])
   /* console.log('continueAnimation')
    console.log('Time: ' + animate.mixers[IndexPagina]._actions[1].time)
    console.log('Duration: ' + animate.mixers[IndexPagina]._actions[1].getClip().duration) */
    if (animate.mixers[IndexPagina]._actions[2].time <= (animate.mixers[IndexPagina]._actions[2].getClip().duration-0.01)) //Le resto 0.1 a la duracion para que esta termine por completa si no se ejecuta la siguiente
    {
        // Continuar actualizando el mezclador hasta que la animación se haya completado
        requestAnimationFrame(function() {
            continueAnimation(velocity);
        });

        // Calcular deltaTime basado en la velocidad
        const deltaTime = (velocitatGeneral * velocity * 0.016) * 100; // 0.016 es aproximadamente un frame a 60fps
        //console.log(animate.mixers[IndexPagina])
        //console.log('Velocity: ' + velocity)
        console.log('Velocity General: ' + velocitatGeneral)
        console.log('Time: ' + animate.mixers[IndexPagina]._actions[2].time)
        console.log('Delta Time: ' + deltaTime)
        animate.mixers[IndexPagina].update(deltaTime);
    }else{
        animate.mixers[IndexPagina].update(5)
    }
    CheckInstance()
}

async function finish(e) {
        console.log(animate.mixers[IndexPagina])
        if(e.action._clip.name === 'ParentAction'){
            await esperarMouseUp();
            
            if(totalDistance >= 0){
                IndexPagina++;
                // Reiniciar la velocidad y otros parámetros al finalizar
                velocitatGeneral = 0;
                totalDistance = 0; // Resetear la distancia total
                endVelocity = 0; // Resetear la velocidad final
                console.log('Índice actual:', IndexPagina);
            }
           
        }
        console.log('Indice: ' + IndexPagina);
}

function esperarMouseUp() {
    return new Promise(resolve => { 
        if(!mousedown){
            resolve();
            return;
        }
        function onMouseUp(event) {
            document.removeEventListener('mouseup', onMouseUp);
            resolve(event);
        }
        document.addEventListener('mouseup', onMouseUp);
    });
}

function InstantitzePage(){

    const totalImatges = 3
    let newPage = SkeletonUtils.clone(firstPage);
    newPage.children[1].material = newPage.children[1].material.clone()
    indexImagen = ( (IndexPagina) % totalImatges);
    var indexImagenBack = ( (IndexPagina + 3 ) % totalImatges) ;
    // Pagines Textures
    const textureFront = textureLoader.load(`./Pagines/pagina-${indexImagen+1}.jpeg`);
    const textureBack = textureLoader.load(`./Pagines/pagina-${indexImagenBack}.jpeg`);
    
    const material = newPage.children[1].material;

    //newPage.children[1].material.map = PaginaColorTexture

    material.side = THREE.DoubleSide; // Hacer que el material sea visible desde ambos lados

    //TODO: He de fer una funcio per utilitzar la mateixa que la primera instancia
    // Usar `onBeforeCompile` para cambiar la textura según la normal
    material.onBeforeCompile = function (shader) {
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

    //TODO: Segurament tambe es pot juntar tot amb la primera instancia
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


    [parentActionNew,emptyActionNew,KeyActionNew].forEach(actions => {
        actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
        actions.clampWhenFinished = true; // Detener la animación al finalizar
        actions.reset().play(); // Iniciar la animación
    });

    newMixer.setTime(0)
    pages.push(newPage);
    scene.add(newPage);
    //console.log(pages);
}

function configurarMateriales(model) {
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
                
                
                let totalImatges1 = 3

                const material = child.material;
                indexImagen = ( (IndexPagina) % totalImatges1);
                var indexImagenBack = ( (IndexPagina + 3 ) % totalImatges1) ;
                // Pagines Textures
                const textureFront1 = textureLoader.load(`./Pagines/pagina-${indexImagen+1}.jpeg`);
                const textureBack1 = textureLoader.load(`./Pagines/pagina-${indexImagenBack}.jpeg`);
                
                //newPage.children[1].material.map = PaginaColorTexture

                material.side = THREE.DoubleSide; // Hacer que el material sea visible desde ambos lados

                // Usar `onBeforeCompile` para cambiar la textura según la normal
                material.onBeforeCompile = function (shader) {
                    shader.uniforms.textureFront = { value: textureFront1 };
                    shader.uniforms.textureBack = { value: textureBack1 };

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

                // Ajustar otras propiedades según sea necesario
                child.material.needsUpdate = true;
            }
        }
    });
}

function configurarAnimaciones(model,gltf){
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

    [planeAction,emptyAction,parentAction].forEach(actions => {
        actions.setLoop(THREE.LoopOnce); // Establecer el bucle para que solo se ejecute una vez
        actions.clampWhenFinished = true; // Detener la animación al finalizar
        actions.play(); // Iniciar la animación
    });
}

function CheckInstance(){
    
    //console.log('checkig ' + IndexPagina)
    //console.log('pages.length ' + pages.length)

    if(pages.length == (IndexPagina+1) && animate.mixers[IndexPagina]._actions[2].time > (animate.mixers[IndexPagina]._actions[2].getClip().duration * 0.05)){ //Calculo que añada la nueva pagina al pasar el 5% de la animacion para que no aparezca encima de la que se esta animando
        console.log('crear pagina')
        InstantitzePage()
    }
    if(pages.length == (IndexPagina+2) && animate.mixers[IndexPagina]._actions[2].time < (animate.mixers[IndexPagina]._actions[2].getClip().duration * 0.05)){ //Calculo que añada la nueva pagina al pasar el 5% de la animacion para que no aparezca encima de la que se esta animando
        console.log('ENTER')
        scene.remove(pages[IndexPagina+1]);
        animate.mixers.pop()
        pages.pop();
    }
    if( pages.length == (IndexPagina+2) && animate.mixers[IndexPagina]._actions[2].time > (animate.mixers[IndexPagina]._actions[2].getClip().duration * 0.7)){ //Calculo que añada la nueva pagina al pasar el 5% de la animacion para que no aparezca encima de la que se esta animando
        console.log('Quitar ultima pagina')
        console.log(pages[IndexPagina-1])
        scene.remove(pages[IndexPagina-1]);
        //animate.mixers.pop()
        //pages.pop();
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
