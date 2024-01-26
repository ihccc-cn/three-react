import * as THREE from 'three';
import geoJsonData from './geo.json';

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
  camera.position.z = 1;
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // 创建一个新的顶点数组
  const points: THREE.Vector3[] = [];
  // 遍历每个多边形
  for (let i = 0; i < geoJsonData.features.length; i++) {
    const feature = geoJsonData.features[i];
    console.log(feature);

    const coordinates = feature.geometry.coordinates;

    for (let j = 0; j < coordinates.length; j++) {
      const coord = coordinates[j] as any;
      points.push(new THREE.Vector3(coord[0], coord[1], 0)); // 假设所有点都在z=0的平面上
    }
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);

  // 添加到场景中
  scene.add(line);

  // animation
  renderer.setAnimationLoop(function animation(time) {
    renderer.render(scene, camera);
  });

  return renderer;
}

export default demo;
