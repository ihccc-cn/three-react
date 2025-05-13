import React, { type FC } from 'react';
import * as THREE from 'three';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../../utils/create-three';

// const sceneBg = '/three-demo/docklands_02_2k.hdr';
// const sceneBg = '/three-demo/docklands_02_4k.exr';

function demo(opts: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 4 });
  engine.addControls({
    autoRotate: true,
    autoRotateSpeed: 0.4,
    maxDistance: 15,
  });
  engine.addAxesHelper();
  engine.camera?.position.set(0, 0, 0.1);

  // 加载单张全景图
  // const textureLoader = new THREE.TextureLoader();
  // const geometry = new THREE.SphereGeometry(6, 256, 256);
  // const material = new THREE.MeshBasicMaterial({
  //   map: textureLoader.load(sceneBg),
  //   side: THREE.BackSide,
  // });

  // const sphere = new THREE.Mesh(geometry, material);
  // engine.scene.add(sphere);

  const geometry = new THREE.SphereGeometry(6, 256, 256);
  const material = new THREE.MeshStandardMaterial({
    side: THREE.BackSide,
    displacementScale: -4.0,
  });

  const sphere = new THREE.Mesh(geometry, material);

  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);

  loader.load('/image/kandao3.jpg', function (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    sphere.material.map = texture;
  });

  loader.load('/image/kandao3_depthmap.jpg', function (depth) {
    depth.minFilter = THREE.NearestFilter;
    depth.generateMipmaps = false;
    sphere.material.displacementMap = depth;
  });

  manager.onLoad = function () {
    engine.scene.add(sphere);
  };

  engine.start();

  return engine;
}

const App: FC<{}> = () => <ThreeViewer render={demo} />;

export default App;
