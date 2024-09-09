import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';

import * as THREE from 'three';
import CreateThree, { TGLTFResult } from '../../../utils/create-three';
import CreateAnimation from '../../../utils/create-animation';

import {
  ASSET_PATH,
  ASSETS,
  ITEM_SIZE,
  DEFAULT_ACTION_NAME,
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

  const skeletonAnimation = new CreateAnimation(DEFAULT_ACTION_NAME);

  if (engine.gui) {
    engine.gui.controller.actionName.onChange((actionName: string) => {
      skeletonAnimation.play(actionName);
    });
  }

  const onLoaded = (models: TGLTFResult) => {
    onLoadInfo({});

    const gltf = models.Skeleton_Minion;
    const model = gltf.scene;
    model.position.set(0, -ITEM_SIZE / 2, 0);
    engine.scene.add(model);

    const skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    engine.scene.add(skeleton);
    if (engine.gui) {
      engine.gui.controller.skeletonHelper.onChange((visible: boolean) => {
        skeleton.visible = visible;
      });
    }

    gltf.animations.forEach((clip) => {
      skeletonAnimation.add(clip.name);
    });

    skeletonAnimation.createByGltf(gltf);

    // 创建时钟对象
    const clock = new THREE.Clock();

    engine.start(() => {
      // 计算时间差
      const deltaTime = clock.getDelta();
      // 更新动画混合器
      skeletonAnimation.update(deltaTime);
    });
  };

  engine.loadGltfs(ASSETS, { path: ASSET_PATH, onLoadInfo, onLoaded });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
