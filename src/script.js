import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;
let objectDistance = 3.5;
let objects = [];

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
    // Chargez le modèle avec le GLTFLoader et suivez le chargement
    const canap = await loadModel("/models/room.glb", (xhr) => {
      const percentage = (xhr.loaded / xhr.total) * 100;
      updateLoadingProgress(percentage);
    });

    canap.scene.position.z = 0;
    objects.push(canap.scene);
    scene.add(canap.scene);

    // Mettre à jour la barre de chargement à 100% une fois que tout est chargé
    updateLoadingProgress(100);
    // Afficher la scène une fois que tout est chargé
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
walls.position.z = -3;
scene.add(floor);
scene.add(walls);

// Call loadModels to initiate the loading process
loadModels();

/**
 * Floor
 */

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 2, 1);
light.castShadow = true; // Activer les ombres pour la lumière
light.shadow.mapSize.width = 1024; // Largeur de la carte d'ombre
light.shadow.mapSize.height = 1024; // Hauteur de la carte d'ombre
scene.add(light);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
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
  loadingProgress.innerHTML =` ${Math.floor(progress)} %`
}

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
      }, 200);
    }
  }, 40); // Intervalle de mise à jour de la barre de chargement (en millisecondes)
}


simulateLoading();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Mise à jour de la position de la caméra en fonction du scroll
  const scrollPercentage = scrollY / (document.body.scrollHeight - window.innerHeight);
  const lerpedPosition = new THREE.Vector3().lerpVectors(cameraDefaultPosition, cameraFinalPosition, scrollPercentage);
  camera.position.copy(lerpedPosition);
  camera.lookAt(0, 1, 0);

  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

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
