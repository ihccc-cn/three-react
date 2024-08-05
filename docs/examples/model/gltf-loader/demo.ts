import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import initThree from '../../../utils/initThree';

function demo(opts?: object) {
  const { renderer, scene, start } = initThree(opts);

  const loader = new GLTFLoader();
  loader.load(
    '/model/gltf/building_A.gltf',
    function (gltf: GLTFLoader) {
      const model = gltf.scene;
      model.position.set(-1.2, -0.75, 0);
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error(error);
    },
  );
  loader.load(
    '/model/gltf/building_B.gltf',
    function (gltf: GLTFLoader) {
      const model = gltf.scene;
      model.position.set(1.2, -0.75, 0);
      scene.add(model);
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
