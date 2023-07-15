import * as THREE from 'three';

const defaultConfig = {
  width: 960,
  height: 600,
  backgroundColor: 0x393939,
  alpha: 1.0,
};

function demo(opts?: object) {
  const { width, height, backgroundColor, alpha } = Object.assign(
    defaultConfig,
    opts,
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(backgroundColor);
  renderer.setClearAlpha(alpha);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.z = 1;
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // 线段
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points: THREE.Vector3[] = [];
  points.push(new THREE.Vector3(-100, 0, 0));
  points.push(new THREE.Vector3(0, 100, 0));
  points.push(new THREE.Vector3(100, 0, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // 平面
  // const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // const planeGeo = new THREE.PlaneGeometry(1.5, 1.5);
  // const plane = new THREE.Mesh(planeGeo, material);
  // plane.position.x = 1;
  // scene.add(plane);

  // // 三角形 Geometry?
  // function demoTriangle() {
  // const triGeo = new THREE.Geometry();
  // triGeo.vertices = [new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(-2, -0.8, 0), new THREE.Vector3(-1, 0.8, 0)];
  // triGeo.faces.push(new THREE.Face3(0, 2, 1));
  // const triangle = new THREE.Mesh(triGeo, material);
  // scene.add(triangle);
  // }
  // demoTriangle();

  // // 立方体 CubeGeometry?
  // function demoCube() {
  // const geometry = new THREE.CubeGeometry(1, 2, 3);
  // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);
  // }
  // demoCube();

  renderer.render(scene, camera);

  return renderer;
}

export default demo;
