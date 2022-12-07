import * as THREE from "three";

function main({ canvas }) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });

  // 照相机
  const camera = new THREE.OrthographicCamera(-5, 5, 3.75, -3.75, 0.1, 100);
  camera.position.set(25, 25, 25);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 添加一个球体
  // const sphere = new THREE.SphereGeometry(50, 8, 6, 0, Math.PI * 2, 0, Math.PI);

  // 设置照相机在球体中心

  // 在球体内部贴上全景图片

  // 控制旋转照相机的角度

  const scene = new THREE.Scene();
  scene.add(camera);

  // render
  renderer.render(scene, camera);
}

export default main;
