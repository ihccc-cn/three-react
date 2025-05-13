import * as THREE from 'three';
import EventEmitter from 'eventemitter3';
import TWEEN from '@tweenjs/tween.js';

type TScene = {
  name: string;
  texture: string;
  x?: number;
  y?: number;
  z?: number;
};

export type TSceneData = {
  defaultSceneIndex: number;
  scenes: TScene[];
};

class CreateSceneTour extends EventEmitter {
  sceneData!: TSceneData;

  scenes: Record<string, any>;

  sceneIndex: number;

  constructor(sceneData?: TSceneData) {
    super();

    this.sceneData = sceneData || { defaultSceneIndex: 0, scenes: [] };
    this.scenes = {};

    this.sceneIndex = sceneData?.defaultSceneIndex || 0;

    this.load(this.sceneData);
  }

  load(sceneData: TSceneData) {
    const scenes = sceneData.scenes;
    this.sceneIndex = sceneData.defaultSceneIndex || 0;

    scenes.forEach((scene) => {
      const size = 6;
      const geometry = new THREE.SphereGeometry(size, 256, 256);

      const material = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        displacementScale: -4.0,
      });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = 2 * size * (scene.x || 0);
      sphere.position.y = 2 * size * (scene.y || 0);
      sphere.position.z = 2 * size * (scene.z || 0);

      const manager = new THREE.LoadingManager();
      const loader = new THREE.TextureLoader(manager);

      loader.load(scene.texture, function (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        sphere.material.map = texture;
      });

      manager.onLoad = () => {
        this.emit('load', sphere);
      };

      this.scenes[scene.name] = { sphere };
    });
  }

  start() {}

  stop() {}

  pause() {}

  change(sceneIndex: number) {
    if (!!this.scenes[sceneIndex]) {
      const sphere = this.scenes[sceneIndex].sphere;
      this.emit('change', sphere);
      // // 保存当前相机参数
      // const startPos = camera.position.clone();
      // const startQuat = camera.quaternion.clone();

      // // 计算目标参数
      // const targetPos = sphere.position.clone();
      // const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      //   new THREE.Vector3(0, 0, -1),
      //   targetPos.clone().sub(camera.position).normalize(),
      // );

      // // 创建位置插值
      // new TWEEN.Tween(startPos)
      //   .to(targetPos, 2000)
      //   .easing(TWEEN.Easing.Quadratic.InOut)
      //   .onUpdate(() => camera.position.copy(startPos))
      //   .start();

      // // 创建旋转插值
      // new TWEEN.Tween({ t: 0 })
      //   .to({ t: 1 }, 2000)
      //   .onUpdate(({ t }) => {
      //     THREE.Quaternion.slerp(startQuat, targetQuat, camera.quaternion, t);
      //   })
      //   .start();
    }
  }
}

export default CreateSceneTour;
