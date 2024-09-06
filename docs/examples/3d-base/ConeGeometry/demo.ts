import * as THREE from 'three';

const defaultConfig = {
  width: 960,
  height: 600,
  backgroundColor: 0x393939,
  alpha: 0.0,
};

function demo(opts?: object) {
  const { width, height, backgroundColor, alpha } = {
    ...defaultConfig,
    ...opts,
  };

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(backgroundColor, alpha);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  const coneGeometry = new THREE.ConeGeometry(1, 2);
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  scene.add(cone);

  // animation
  renderer.setAnimationLoop(function animation(time) {
    cone.rotation.x = time / 2000;
    cone.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
