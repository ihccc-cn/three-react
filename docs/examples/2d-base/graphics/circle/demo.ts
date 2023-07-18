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
  camera.position.z = 1;
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  function getCircle(segments?: number) {
    const circleGeometry = new THREE.CircleGeometry(0.8, segments);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    scene.add(circle);
    return circle;
  }

  const triangle = getCircle(3);
  triangle.position.x = -2;

  const pentagon = getCircle(5);

  const circle = getCircle(64);
  circle.position.x = 2;

  renderer.setAnimationLoop(function animation(time) {
    circle.rotation.x = time / 2000;
    circle.rotation.y = time / 2000;
    triangle.rotation.x = time / 2000;
    triangle.rotation.y = time / 2000;
    pentagon.rotation.x = time / 2000;
    pentagon.rotation.y = time / 2000;
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
