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
const col = 200;
const ITEM_SIZE = 2;

function demo(opts: object, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 1 });
  engine.addControls();
  engine.camera?.position.set(25, 3, 40);

  const loader = new GLTFLoader();

  const onProgress = (name: string, progress: number) => {
    setViewInfo({ type: 'loading', title: `正在加载模型 - ${name}`, progress });
  };

  const onLoaded = (models: TResult) => {
    setViewInfo({});

    console.log(models);

    modelAssets.forEach((name, z) => {
      // 获取模型的几何体和材质
      const geometry = models[name].children[0].geometry;
      const material = models[name].children[0].material;

      // 创建实例化几何体
      const instancedGeometry = new THREE.InstancedBufferGeometry().copy(
        geometry,
      );
      // 为每个实例设置不同的位置
      const positions = new Float32Array(col * 3);
      for (let x = 0; x < col; x++) {
        // const model = models[name].clone();
        // model.position.set((x - (col / 2) ) * ITEM_SIZE, 0, z * ITEM_SIZE);
        // engine.scene.add(model);

        const x1 = (x - col / 2) * ITEM_SIZE;
        const z1 = z * ITEM_SIZE;
        positions[x * 3] = x1;
        positions[x * 3 + 1] = 0;
        positions[x * 3 + 2] = z1;
      }
      instancedGeometry.setAttribute(
        'instancePosition',
        new THREE.InstancedBufferAttribute(positions, 3),
      );
      // 创建网格
      const mesh = new THREE.Mesh(instancedGeometry, material);
      engine.scene.add(mesh);
    });
  };

  loadGltfs(loader, modelAssets, { assetPath, onLoaded, onProgress });

  engine.start();

  return engine;
}

export default demo;
