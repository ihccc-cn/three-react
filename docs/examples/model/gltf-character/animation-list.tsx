import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';

import * as THREE from 'three';
import CreateThree, { TGLTFResult } from '../../../utils/create-three';

import {
  ASSET_PATH,
  ASSETS,
  ITEM_SIZE,
  ACTION_NAME,
  GUI_VALUES,
  GUI_OPTIONS,
} from './config';

export function demo(opts: object, onLoadInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 1 });
  engine.addControls();
  engine.addGui(GUI_VALUES, GUI_OPTIONS, { title: '渲染参数' });
  engine.camera?.position.set(0, 0, 4);

  const onLoaded = (models: TGLTFResult) => {
    onLoadInfo({});

    const gltf = models.Skeleton_Minion;
    const model = gltf.scene;
    model.position.set(0, -ITEM_SIZE / 2, 0);
    engine.scene.add(model);

    const skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = true;
    engine.scene.add(skeleton);

    const mixer = new THREE.AnimationMixer(model);

    const animation = gltf.animations.find((clip) => clip.name === ACTION_NAME);

    if (!!animation) {
      const action = mixer.clipAction(animation);
      action.play();
    }

    // 创建时钟对象
    const clock = new THREE.Clock();

    engine.start(() => {
      // 计算时间差
      const deltaTime = clock.getDelta();
      // 更新动画混合器
      mixer.update(deltaTime);
    });
  };

  engine.loadGltfs(ASSETS, { path: ASSET_PATH, onLoadInfo, onLoaded });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
