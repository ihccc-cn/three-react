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

  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
  const cylinderMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  scene.add(cylinder);

  // animation
  renderer.setAnimationLoop(function animation(time) {
    cylinder.rotation.x = time / 2000;
    cylinder.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
