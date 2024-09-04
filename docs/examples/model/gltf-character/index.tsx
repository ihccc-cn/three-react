import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';

// import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CreateThree from '../../../utils/create-three';
import loadGltfs, { TResult } from '../../../utils/load-gltfs';

const assetPath = '/model/KayKit_Skeletons_1.0_FREE/characters/gltf/{name}.glb';
const modelAssets = [
  'Skeleton_Mage', // 0
  'Skeleton_Minion', // 1
  'Skeleton_Rogue', // 2
  'Skeleton_Warrior', // 3
];

const ITEM_SIZE = 2;

function demo(opts: object, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 1 });
  engine.addControls();
  engine.camera?.position.set(0, 0, 8);

  // 将每个物体都渲染出来
  const renderItems = (models: TResult, assets: string[], rows: number = 1) => {
    const cols = Math.floor(assets.length / rows);
    assets.forEach((name, i) => {
      //
      const model = models[name];
      const row = Math.floor(i / cols);
      const col = i % cols;
      model.position.set(
        col * ITEM_SIZE - ((cols - 1) * ITEM_SIZE) / 2,
        -ITEM_SIZE / 2,
        row * ITEM_SIZE - ((rows - 1) * ITEM_SIZE) / 2,
      );
      engine.scene.add(model);
    });
  };

  const onLoaded = (models: TResult) => {
    setViewInfo({});

    console.log(models);
    renderItems(models, modelAssets);
  };

  const onProgress = (name: string, progress: number) => {
    setViewInfo({ type: 'loading', title: `正在加载模型 - ${name}`, progress });
  };

  loadGltfs(new GLTFLoader(), modelAssets, { assetPath, onLoaded, onProgress });

  engine.start();

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
