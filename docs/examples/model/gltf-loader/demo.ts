// import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CreateThree from '../../../utils/create-three';

function demo(opts?: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight();
  engine.addControls();
  engine.camera?.position.set(0, 0, 8);

  const loader = new GLTFLoader();

  loader.load(
    '/model/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf/building_A.gltf',
    function (gltf: any) {
      const model = gltf.scene;
      model.position.set(-1.2, -1, 0);
      engine.scene.add(model);
    },
  );
  loader.load(
    '/model/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf/building_B.gltf',
    function (gltf: any) {
      const model = gltf.scene;
      model.position.set(1.2, -1, 0);
      engine.scene.add(model);
    },
  );

  engine.start();

  return engine;
}

export default demo;
