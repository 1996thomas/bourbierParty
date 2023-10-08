// loading.js

// Sélectionnez l'élément HTML pour le composant de chargement
const loadingContainer = document.querySelector(".loading-container");
const progressBar = document.querySelector(".progress-bar");
const loadingMessage = document.querySelector(".loading-message");

// Créez un gestionnaire de chargement pour les ressources
const resourceLoader = new ResourceLoader();

// Définissez les ressources à charger ici
const resourcesToLoad = [
  "/models/room.glb",
  "/textures/texture1.png",
  // Ajoutez d'autres ressources ici
];

// Variable pour suivre le nombre de ressources chargées
let loadedResources = 0;

// Fonction de mise à jour de la barre de progression
function updateProgressBar() {
  loadedResources++;
  const progress = (loadedResources / resourcesToLoad.length) * 100;
  progressBar.style.width = progress + "%";

  // Mettez à jour le message de chargement
  loadingMessage.textContent = `Chargement : ${progress.toFixed(1)}%`;
}

// Chargez chaque ressource et mettez à jour la barre de progression
resourcesToLoad.forEach((resourceUrl) => {
  resourceLoader.loadResource(resourceUrl, () => {
    updateProgressBar();
  });
});
