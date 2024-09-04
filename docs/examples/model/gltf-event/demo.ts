import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import initThree from '../../../utils/initThree';

type TThreeEvent = {
  nativeEvent: MouseEvent;
  object: THREE.Object3D;
  intersects: any[];
};

function connectEvent(
  scene: THREE.Scene,
  camera: THREE.Camera,
  callback?: (event: TThreeEvent) => any,
) {
  // 计算鼠标位置
  const mouse = new THREE.Vector2();
  // 创建射线
  const raycaster = new THREE.Raycaster();

  // 射线检测
  return function mouseEvent(event: MouseEvent) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 检测与场景中对象的交集
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      callback?.({
        nativeEvent: event,
        object: intersects[0].object,
        intersects,
      });
    }
  };
}

function demo(opts?: object) {
  const { renderer, scene, camera, start } = initThree(opts);

  let model: null | THREE.Scene = null;

  const loader = new GLTFLoader();
  loader.load(
    '/model/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf/building_D.gltf',
    function (gltf: any) {
      model = gltf.scene;
      if (!model) return;
      model.position.y = -1;
      scene.add(model);
    },
  );

  // 射线检测
  function handleClick(event: TThreeEvent) {
    const object = event.object;
    console.log('Clicked on:', object);
    alert('uuid: ' + object.uuid);
  }

  // 监听事件
  renderer.domElement.addEventListener(
    'click',
    connectEvent(scene, camera, handleClick),
  );

  start();

  return renderer;
}

export default demo;
