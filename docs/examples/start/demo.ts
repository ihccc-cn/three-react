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

  // 盒子
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // animation
  renderer.setAnimationLoop(function animation(time) {
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
