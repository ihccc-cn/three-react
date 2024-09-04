import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import CreateThree from '../../../utils/create-three';
import loadGltfs, { TResult } from '../../../utils/load-gltfs';

const assetPath =
  '/model/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf/{name}.gltf';
const modelAssets = [
  'base', // 0
  'bench', // 1
  'box_A', // 2
  'box_B', // 3
  'building_A', // 4
  'building_A_withoutBase', // 5
  'building_B', // 6
  'building_B_withoutBase', // 7
  'building_C', // 8
  'building_C_withoutBase', // 9
  'building_D', // 10
  'building_D_withoutBase', // 11
  'building_E', // 12
  'building_E_withoutBase', // 13
  'building_F', // 14
  'building_F_withoutBase', // 15
  'building_G', // 16
  'building_G_withoutBase', // 17
  'building_H', // 18
  'building_H_withoutBase', // 19
  'bush', // 20
  'car_hatchback', // 21
  'car_police', // 22
  'car_sedan', // 23
  'car_stationwagon', // 24
  'car_taxi', // 25
  'dumpster', // 26
  'firehydrant', // 27
  'road_corner', // 28
  'road_corner_curved', // 29
  'road_junction', // 30
  'road_straight', // 31
  'road_straight_crossing', // 32
  'road_tsplit', // 33
  'streetlight', // 34
  'trafficlight_A', // 35
  'trafficlight_B', // 36
  'trafficlight_C', // 37
  'trash_A', // 38
  'trash_B', // 39
  'watertower', // 40
];

const ITEM_SIZE = 2;
const LAYER_SPACE = 0.12;

const W = 270; // 西
const N = 180; // 北
const E = 90; // 东
// const S = 0; // 南

const layer_ground = [
  [29 + N, 12 + E, 29, 31 + E, 31 + E, 33 + E, 31 + E, 31 + E],
  [10, 16, 32, 18, 4, 12, 8, 14],
  [31 + E, 32 + E, 30, 32 + E, 31 + E, 31 + E, 31 + E, 31 + E],
  [12 + N, 0, 32, 10 + N, 14 + N, 18 + N, 10 + N, 16 + N],
  [0, 16 + E, 31, 6 + W, 0, 0, 10, 0],
  [33 + W, 31 + E, 33 + N, 10, 18, 29, 31 + E, 31 + E],
  [31, 4 + W, 29 + E, 31 + E, 32 + E, 33 + N, 12 + N, 16 + N],
  [31, 12 + W, 6 + N, 16 + N, 10 + N, 31, 0, 18],
];

const layer_building = [
  [-1, 34 + N, -1, 34, -1, -1, -1, -1],
  [34 + E, 37 + E, -1, 37, 34 + E, 34 + E, 34 + E, 34 + E],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [34 + W, 37 + N, -1, 37 + W, 34 + W, 34 + W, 34 + W, 34 + W],
  [-1, 34 + N, -1, 34, -1, -1, -1, -1],
  [-1, -1, -1, 34, -1, -1, -1, -1],
  [-1, 34 + N, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1],
];

const layer_car_1 = [
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, 21, -1, -1, -1, -1, -1],
  [-1, 22 + E, -1, 23 + E, -1, 24 + E, 21 + E, -1],
  [-1, -1, 24, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, 22 + E, -1, -1],
  [-1, -1, 25, -1, -1, -1, 23 + E, -1],
  [24, -1, -1, -1, -1, -1, -1, -1],
  [23, -1, -1, -1, -1, -1, -1, -1],
];

const layer_car_2 = [
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [-1, 23 + W, -1, -1, 21 + W, 25 + W, -1, 24 + W],
  [-1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, 21 + N, -1, -1, -1, -1, -1],
  [24 + W, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, 22 + W, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, 21 + N, -1, -1],
];

function demo(opts: object, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 1 });
  engine.addControls();
  engine.addMainLightHelper();
  if (engine.camera) {
    engine.camera.fov = 50;
    engine.camera.near = 1;
    engine.camera.far = 5000;
    engine.camera.position.set(-0.036, 0.623, 11.987);
    engine.controls?.target.set(0.64, 0.692, 11.049);
  }

  const loader = new GLTFLoader();

  // 将每个物体都渲染出来
  // const renderItems = (models: TResult, assets: string[], rows: number = 1) => {
  //   const cols = Math.floor(assets.length / rows);
  //   assets.forEach((name, i) => {
  //     const model = models[name].clone();
  //     const row = Math.floor(i / cols);
  //     const col = i % cols;
  //     model.position.set(
  //       col * ITEM_SIZE,
  //       0,
  //       row * ITEM_SIZE - (rows + 1) * ITEM_SIZE,
  //     );
  //     engine.scene.add(model);
  //   });
  // };

  const renderLayer = (
    layer: number[][],
    models: TResult,
    assets: string[],
    layerIndex: number = 0,
    handle?: Function,
  ) => {
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        for (let x = 0; x < layer.length; x++) {
          for (let y = 0; y < layer[x].length; y++) {
            const id = layer[y][x];
            if (id < 0) continue;
            const name = assets[id % 90];
            const model = models[name].clone();
            model.position.set(
              x * ITEM_SIZE + ox * ITEM_SIZE * 8,
              layerIndex * LAYER_SPACE,
              y * ITEM_SIZE + oy * ITEM_SIZE * 8,
            );
            if (id >= 90) model.rotateY((Math.floor(id / 90) * Math.PI) / 2);
            handle?.(id, model);
            engine.scene.add(model);
          }
        }
      }
    }
  };

  const onLoaded = (models: TResult) => {
    setViewInfo({});

    console.log(models);
    // renderItems(models, modelAssets, 4);
    renderLayer(layer_ground, models, modelAssets, 0);
    renderLayer(
      layer_building,
      models,
      modelAssets,
      0,
      (id: number, model: THREE.Group) => {
        if ([35, 36, 37].includes(id % 90)) {
          model.translateX(-1);
          model.translateZ(1);
        }
        if ([34].includes(id % 90)) {
          model.translateX(-1);
        }
      },
    );
    renderLayer(
      layer_car_1,
      models,
      modelAssets,
      1,
      (id: number, model: THREE.Group) => {
        if ([21, 22, 23, 24, 25].includes(id % 90)) model.translateX(-0.3);
      },
    );
    renderLayer(
      layer_car_2,
      models,
      modelAssets,
      1,
      (id: number, model: THREE.Group) => {
        if ([21, 22, 23, 24, 25].includes(id % 90)) model.translateX(-0.3);
      },
    );
  };

  const onProgress = (name: string, progress: number) => {
    setViewInfo({ type: 'loading', title: `正在加载模型 - ${name}`, progress });
  };

  loadGltfs(loader, modelAssets, { assetPath, onLoaded, onProgress });

  engine.start();

  return engine;
}

export default demo;
