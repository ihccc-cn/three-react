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

  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  renderer.setAnimationLoop(function animation(time) {
    plane.rotation.x = time / 2000;
    plane.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
