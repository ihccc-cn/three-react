import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CreateThree from '../../../utils/create-three';
import loadGltfs, { TFullResult } from '../../../utils/load-gltfs';

const assetPath = '/model/KayKit_Skeletons_1.0_FREE/characters/gltf/{name}.glb';
const modelAssets = [
  'Skeleton_Minion', // 1
];

const ITEM_SIZE = 2;
const SKELETON_VISIBLE = false;
const ACTION_NAME = 'Running_A';

export function demo(opts: object, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 1 });
  engine.addControls();
  engine.camera?.position.set(0, 0, 4);

  const onLoaded = (models: TFullResult) => {
    setViewInfo({});

    const gltf = models.Skeleton_Minion;
    const model = gltf.scene;
    model.position.set(0, -ITEM_SIZE / 2, 0);
    engine.scene.add(model);

    // 创建时钟对象
    const clock = new THREE.Clock();

    const skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = SKELETON_VISIBLE;
    engine.scene.add(skeleton);

    const mixer = new THREE.AnimationMixer(model);

    console.log(
      'Gltf Animation Names::',
      gltf.animations.map((c) => c.name),
    );

    const animation = gltf.animations.find((clip) => clip.name === ACTION_NAME);

    if (!!animation) {
      const action = mixer.clipAction(animation);
      action.play();
    }

    engine.start(() => {
      // 计算时间差
      const deltaTime = clock.getDelta();
      // 更新动画混合器
      mixer.update(deltaTime);
    });
  };

  const onProgress = (name: string, progress: number) => {
    setViewInfo({ type: 'loading', title: `正在加载模型 - ${name}`, progress });
  };

  loadGltfs(new GLTFLoader(), modelAssets, {
    assetPath,
    fullModel: true,
    onLoaded,
    onProgress,
  });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
