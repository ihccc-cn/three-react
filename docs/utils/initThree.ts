import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type TConfig = {
  width: number;
  height: number;
  backgroundColor: number | string;
  alpha: number;
  antialias: boolean;
  controls: Record<string, any>;
  ambientLight: Record<string, any>;
};

const defaultConfig = {
  width: 960,
  height: 600,
  backgroundColor: 0x393939,
  alpha: 0.0,
  antialias: true,
  controls: {
    enableDamping: true, // 启用阻尼效果
    dampingFactor: 0.05, // 设置阻尼因子
    enablePan: true, // 允许平移
    enableRotate: true, // 允许旋转
    enableZoom: true, // 允许缩放
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 0.8,
    minDistance: 1, // 最小距离
    maxDistance: 100, // 最大距离
    maxPolarAngle: Math.PI / 2, // 限制相机不能翻转到模型后面
    autoRotate: true, // 启用自动旋转
    autoRotateSpeed: 1.0, // 设置自动旋转的速度
  },
  ambientLight: {
    color: 0xb9b9b9,
    intensity: 2,
  },
};

function initThree(opts?: object) {
  const envOption: TConfig = {
    ...defaultConfig,
    ...opts,
  };

  const {
    width,
    height,
    backgroundColor,
    alpha,
    antialias,
    controls: controlOpts,
    ambientLight: ambientLightOpts,
  } = envOption;

  const renderer = new THREE.WebGLRenderer({ antialias });
  renderer.setSize(width, height);
  renderer.setClearColor(backgroundColor, alpha);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  // 创建环境光
  let ambientLight: null | THREE.AmbientLight = null;
  if (!!ambientLightOpts) {
    ambientLight = new THREE.AmbientLight(
      ambientLightOpts.color,
      ambientLightOpts.intensity,
    ); // 浅灰色，强度为2
    scene.add(ambientLight);
  }

  let controls: null | OrbitControls = null;
  if (!!controlOpts) {
    controls = new OrbitControls(camera, renderer.domElement);
    for (const key in controlOpts) {
      // @ts-ignore
      controls[key] = controlOpts[key];
    }
  }

  // animation
  function start(callback?: Function) {
    renderer.setAnimationLoop(function animation(...args) {
      controls?.update(); // 更新控制器状态
      callback?.(...args);
      renderer.render(scene, camera);
    });
  }

  return {
    envOption,
    renderer,
    scene,
    camera,
    start,
    ...(!ambientLight ? {} : { ambientLight }),
    ...(!controls ? {} : { controls }),
  };
}

export default initThree;
