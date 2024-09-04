import { Group } from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { decimal } from '@ihccc/utils';

interface IConfig {
  assetPath: string;
  fullModel?: boolean;
  onLoaded?: Function;
  onProgress?: Function;
}

export type TResult = Record<string, Group>;
export type TFullResult = Record<string, GLTF>;

const loadGltfs = (loader: GLTFLoader, assets: any, config: IConfig) => {
  const { assetPath, fullModel, onLoaded, onProgress } = config;
  const models: TResult | TFullResult = {};

  assets.forEach((name: string) => {
    const path = assetPath.replace('{name}', name);
    loader.load(
      path,
      (gltf: GLTF) => {
        models[name] = fullModel ? gltf : gltf.scene;
        if (Object.keys(models).length === assets.length) onLoaded?.(models);
      },
      (event: ProgressEvent<EventTarget>) => {
        const progress = !event.total
          ? -1
          : decimal((event.loaded / event.total) * 100, 1);
        onProgress?.(name, progress);
      },
    );
  });
};

export default loadGltfs;
