import * as THREE from "three";

function main({ canvas }) {
  // init
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0x000000);

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-2, 2, 1.5, -1.5, 1, 10);
  // camera.position.z = 1;
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // 盒子
  function demoBox() {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }
  demoBox();

  // 平面
  // function demoPlane() {
  //   const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  //   const planeGeo = new THREE.PlaneGeometry(1.5, 1.5);
  //   const plane = new THREE.Mesh(planeGeo, material);
  //   plane.position.x = 1;
  //   scene.add(plane);
  // }
  // demoPlane();

  // 三角形 Geometry?
  // function demoTriangle() {
  // const triGeo = new THREE.Geometry();
  // triGeo.vertices = [new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(-2, -0.8, 0), new THREE.Vector3(-1, 0.8, 0)];
  // triGeo.faces.push(new THREE.Face3(0, 2, 1));
  // const triangle = new THREE.Mesh(triGeo, material);
  // scene.add(triangle);
  // }
  // demoTriangle();

  // 立方体 CubeGeometry?
  // function demoCube() {
  // const geometry = new THREE.CubeGeometry(1, 2, 3);
  // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);
  // }
  // demoCube();

  renderer.render(scene, camera);

  // animation
  // renderer.setAnimationLoop(function animation(time) {
  //   mesh.rotation.x = time / 2000;
  //   mesh.rotation.y = time / 1000;
  //   renderer.render(scene, camera);
  // });
}

export default main;
