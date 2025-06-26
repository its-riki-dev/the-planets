import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene, Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 10);

// HDRI
new RGBELoader().load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Stars
const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starSphere = new THREE.Mesh(
  new THREE.SphereGeometry(40, 64, 64),
  new THREE.MeshStandardMaterial({ map: starTexture, side: THREE.BackSide })
);
scene.add(starSphere);

// Planets
const textures = [
  './volcanic/color.png',
  './earth/map.jpg',
  './csilla/color.png',
  './venus/map.jpg',
];

const spheres = new THREE.Group();
const spheresMesh = [];

textures.forEach((texPath, i) => {
  const tex = new THREE.TextureLoader().load(texPath);
  tex.colorSpace = THREE.SRGBColorSpace;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.44, 64, 64),
    new THREE.MeshStandardMaterial({ map: tex })
  );

  const angle = (i / textures.length) * Math.PI * 2;
  sphere.position.x = 4.3 * Math.cos(angle);
  sphere.position.z = 4.3 * Math.sin(angle);

  spheres.add(sphere);
  spheresMesh.push(sphere);
});

spheres.rotation.x = 0.14;
spheres.position.y = -0.65;
scene.add(spheres);

// Post-processing Composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.7,
  0.4,
  0.85
);
composer.addPass(bloomPass);

// Text + Scroll
let headingIndex = 0;
const totalHeadings = textures.length;
let isScrolling = false;

function rotateScene(dir) {
  if (isScrolling) return;
  isScrolling = true;

  gsap.to(spheres.rotation, {
    y: `+=${dir * Math.PI / 2}`,
    duration: 2,
    ease: 'power2.inOut',
  });

  headingIndex = (headingIndex + dir + totalHeadings) % totalHeadings;
  const headings = document.querySelectorAll('.heading h1');
  gsap.to(headings, {
    y: `-${headingIndex * 100}%`,
    duration: 1.5,
    ease: 'power2.inOut'
  });

  setTimeout(() => (isScrolling = false), 2000);
}

// Scroll and Swipe
window.addEventListener('wheel', (e) => rotateScene(e.deltaY > 0 ? 1 : -1));

let touchStartX = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
window.addEventListener('touchend', (e) => {
  const diffX = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diffX) > 50) rotateScene(diffX < 0 ? 1 : -1);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  spheresMesh.forEach(s => s.rotation.y = clock.getElapsedTime() * 0.04);
  composer.render();
}
animate();