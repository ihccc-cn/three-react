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

  const capsuleGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 16);
  const capsuleMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
  scene.add(capsule);

  // animation
  renderer.setAnimationLoop(function animation(time) {
    capsule.rotation.x = time / 2000;
    capsule.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
