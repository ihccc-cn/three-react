import { Group } from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface IConfig {
  assetPath: string;
  onLoaded?: Function;
  onProgress?: Function;
}

export type TResult = Record<string, Group>;

const loadGltfs = (loader: GLTFLoader, assets: any, config: IConfig) => {
  const { assetPath, onLoaded, onProgress } = config;
  const models: TResult = {};

  assets.forEach((name: string) => {
    const path = assetPath.replace('{name}', name);
    loader.load(
      path,
      (gltf: GLTF) => {
        models[name] = gltf.scene;
        if (Object.keys(models).length === assets.length) onLoaded?.(models);
      },
      (event) => onProgress?.(name, event),
    );
  });
};

export default loadGltfs;
