import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";


THREE.ColorManagement.enabled = false;
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;
let objects = [];

const canvas2 = document.createElement("canvas");
canvas2.width = 512;
canvas2.height = 128;
const ctx = canvas2.getContext("2d");

const countdownTexture = new THREE.CanvasTexture(canvas2);
countdownTexture.needsUpdate = true;

const countdownMaterial = new THREE.MeshBasicMaterial({ map: countdownTexture, transparent:true,color:"red" });
const countdownGeometry = new THREE.PlaneGeometry(2, 0.5);
const countdownMesh = new THREE.Mesh(countdownGeometry, countdownMaterial);

countdownMesh.position.set(0, 2.2, -0.99);
scene.add(countdownMesh);

// Créez une fonction pour mettre à jour la texture du compteur
function updateCountdownTexture() {
  const hours = document.querySelector('.hours').textContent;
  const minutes = document.querySelector('.minutes').textContent;
  const seconds = document.querySelector('.seconds').textContent;
  ctx.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx.font = "bold 50px Helvetica";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${hours} : ${minutes} : ${seconds}`, canvas2.width / 2, canvas2.height / 2);
  countdownTexture.needsUpdate = true;
}

// Appelez la fonction pour mettre à jour la texture à chaque seconde
setInterval(updateCountdownTexture, 1000);


function loadModel(url, onProgressCallback) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      resolve,
      onProgressCallback,
      reject
    );
  });
}


async function loadModels() {
  try {
    const canap = await loadModel("/models/room.glb", (xhr) => {
      const percentage = (xhr.loaded / xhr.total) * 100;
      updateLoadingProgress(percentage);
    });

    canap.scene.position.z = 0;
    canap.scene.position.x = -0.0051
    objects.push(canap.scene);
    scene.add(canap.scene);

    scene.visible = true;
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "darkGrey" })
);
const walls = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 10),
  new THREE.MeshBasicMaterial({ color: "grey" })
);

floor.rotation.x = -Math.PI / 2;
walls.position.z = -1;
scene.add(floor);
scene.add(walls);

loadModels();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 2, 1);
light.castShadow = true; 
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const cameraFinalPosition = new THREE.Vector3(0, 0.3, 2);

const cameraDefaultPosition = new THREE.Vector3(0, 1, 10);

cameraDefaultPosition.applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 10);

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.copy(cameraDefaultPosition);
scene.add(camera);

// Controls
//const controls = new OrbitControls(camera, canvas);
//controls.target.set(0, 1, 0);
//controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Barre de chargement
 */
const loadingBar = document.querySelector(".loading-bar");
const loadingProgress = document.querySelector(".loading-progress");

function updateLoadingProgress(progress) {
  const limitedProgress = Math.min(100, progress);
  loadingProgress.innerHTML = ` ${Math.floor(limitedProgress)} %`;}

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

function simulateLoading() {
  const totalSteps = 100; // Nombre total d'étapes de chargement
  let currentStep = 0; // Étape de chargement actuelle
  const loadingWrapper = document.querySelector('.loading__wrapper')

  const interval = setInterval(() => {
    currentStep++;

    // Mettre à jour la barre de chargement
    const progress = (currentStep / totalSteps) * 100;
    updateLoadingProgress(progress);

    if (currentStep === totalSteps) {
      loadingWrapper.classList.add("loading-complete");
      setTimeout(() => {
        loadingWrapper.style.display = "none"
      }, 500);
    }
  }, 40); // Intervalle de mise à jour de la barre de chargement (en millisecondes)
}

simulateLoading();

const video = document.querySelector(".video__wrapper")

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const scrollPercentage = scrollY / (document.body.scrollHeight - window.innerHeight);
  const lerpedPosition = new THREE.Vector3().lerpVectors(cameraDefaultPosition, cameraFinalPosition, scrollPercentage);
  camera.position.copy(lerpedPosition);
  camera.lookAt(0, 1, 0);

  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if(lerpedPosition.z <= (cameraFinalPosition.z + 0.03) ){
    video.style.display = "block"
  }else{
    video.style.display = "none"
  }
  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update controls
  //controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
