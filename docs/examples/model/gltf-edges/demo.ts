import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import initThree from '../../../utils/initThree';

function demo(opts?: object) {
  const { renderer, scene, start } = initThree(opts);

  const loader = new GLTFLoader();
  loader.load(
    '/model/gltf/building_C.gltf',
    function (gltf: GLTFLoader) {
      const model = gltf.scene;

      const geometry = model.children[0].geometry;

      // 创建边框几何体
      const edges = new THREE.EdgesGeometry(geometry);

      // 创建线条材质
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000, // 线条颜色
        linewidth: 2, // 线宽
      });

      // 创建线条
      const line = new THREE.Line(edges, lineMaterial);

      line.position.y = -0.75;
      scene.add(line);

      // model.position.y = -0.75;
      // scene.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );

  start();

  return renderer;
}

export default demo;
