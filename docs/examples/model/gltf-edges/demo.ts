import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import initThree from '../../../utils/initThree';

function demo(opts?: object) {
  const { renderer, scene, start } = initThree(opts);

  const loader = new GLTFLoader();
  loader.load(
    '/model/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf/building_C.gltf',
    function (gltf: any) {
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

      line.position.y = -1;
      scene.add(line);

      // model.position.y = -1;
      // scene.add(model);
    },
  );

  start();

  return renderer;
}

export default demo;
