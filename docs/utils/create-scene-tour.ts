import * as THREE from 'three';
import EventEmitter from 'eventemitter3';

type TScene = {
  name: string;
  texture: string;
  place: 'Center' | 'Front' | 'Back' | 'Left' | 'Right' | 'Top' | 'Down';
  index: number;
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
      const geometry = new THREE.SphereGeometry(6, 256, 256);

      const material = new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        displacementScale: -4.0,
      });
      const sphere = new THREE.Mesh(geometry, material);

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

      this.scenes[scene.name] = {};
    });
  }

  start() {}

  stop() {}

  pause() {}

  change(sceneIndex: number) {}
}

export default CreateSceneTour;
