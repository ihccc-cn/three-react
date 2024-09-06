import * as THREE from 'three';

const defaultConfig = {
  width: 960,
  height: 300,
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

  const ringGeometry = new THREE.RingGeometry(0.6, 1, 30);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  scene.add(ring);

  ring.position.x = -1.5;

  const ring2Geometry = new THREE.RingGeometry(0.6, 1, 5);
  const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial);
  scene.add(ring2);

  ring2.position.x = 1.5;

  renderer.setAnimationLoop(function animation(time) {
    ring.rotation.x = time / 2000;
    ring.rotation.y = time / 2000;
    ring2.rotation.x = time / 2000;
    ring2.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
