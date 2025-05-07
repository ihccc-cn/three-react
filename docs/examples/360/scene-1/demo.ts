import * as THREE from 'three';
import CreateThree from '../../../utils/create-three';

const sceneBg = '/three-demo/docklands_02_2k.hdr';

function demo(opts: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  // engine.addAmbientLight({ intensity: 1 });//
  engine.addControls();

  engine.camera?.position.set(0, 0, 0.1);

  // 加载单张全景图
  const textureLoader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(500, 60, 40);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sceneBg),
    side: THREE.BackSide,
  });

  const sphere = new THREE.Mesh(geometry, material);
  engine.scene.add(sphere);

  engine.start();

  return engine;
}

export default demo;
