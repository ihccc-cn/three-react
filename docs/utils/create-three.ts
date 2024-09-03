import * as THREE from 'three';
// @ts-ignore
import Stats from 'stats.js/src/Stats';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type TLight = {
  color?: THREE.ColorRepresentation;
  intensity?: number;
};

type TConfig = {
  stats?: number;
  width?: number;
  height?: number;
  backgroundColor?: number | string;
  alpha?: number;
  antialias?: boolean;
};

type TOption = {
  stats?: number;
  width: number;
  height: number;
  backgroundColor: number | string;
  alpha: number;
  antialias: boolean;
};

const defaultConfig = {
  stats: 0,
  width: 960,
  height: 600,
  backgroundColor: 0x393939,
  alpha: 0.0,
  antialias: true,
};

class CreateThree {
  option: TOption;

  stats?: Stats;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: null | THREE.PerspectiveCamera = null;
  mainLight: null | THREE.AmbientLight | THREE.DirectionalLight | THREE.Light =
    null;
  ground: null | THREE.Mesh = null;
  grid: null | THREE.GridHelper = null;
  controls: null | OrbitControls = null;

  constructor(option?: TConfig) {
    this.option = Object.assign({}, defaultConfig, option);
    const { stats, width, height, backgroundColor, alpha, antialias } =
      this.option;

    this.renderer = new THREE.WebGLRenderer({ antialias });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(backgroundColor, alpha);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();

    if (typeof stats === 'number' && stats > -1) {
      this.stats = new Stats();
      this.stats.showPanel(stats); // 0: fps, 1: ms, 2: mb, 3+: custom
    }
  }

  /** 创建 Three 环境 */
  static init(option?: TConfig) {
    return new CreateThree(option);
  }

  /** 挂载 dom 节点 */
  mount(container: HTMLDivElement) {
    if (!!this.stats) container.appendChild(this.stats.dom);
    container.appendChild(this.renderer.domElement);
  }

  /** 开始运行 */
  start(callback?: Function) {
    this.renderer.setAnimationLoop((...args) => {
      this.stats?.begin();

      this.controls?.update(); // 更新控制器状态
      callback?.(...args);
      if (!!this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.stats?.end();
    });
  }

  /** 添加透视相机 */
  addPerspectiveCamera() {
    const { width, height } = this.option;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100000);
    this.camera.position.set(40, 40, 40);
    this.scene.add(this.camera);
  }

  /** 添加地面 */
  addGround() {
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }),
    );
    this.ground.position.y = -0.01;
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  /** 添加地面网格 */
  addGroundGrid() {
    this.grid = new THREE.GridHelper(600, 20, 0x000000, 0x000000);
    this.grid.position.y = 0.1;
    this.grid.material.opacity = 0.2;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);
  }

  /** 添加雾效 */
  addFog() {
    this.scene.background = new THREE.Color(0xd9d9d9);
    this.scene.fog = new THREE.Fog(0xd9d9d9, 160, 600);
  }

  /** 添加环境光 */
  addAmbientLight(options?: TLight) {
    options = Object.assign({ color: 0xffffff, intensity: 2 }, options);
    if (!!options) {
      this.mainLight = new THREE.AmbientLight(options.color, options.intensity); // 浅灰色，强度为2
      this.scene.add(this.mainLight);
    }
  }

  /** 添加方向光 */
  addDirectionalLight(options?: TLight) {
    options = Object.assign({ color: 0xffffff, intensity: 2 }, options);
    if (!!options) {
      this.mainLight = new THREE.DirectionalLight(
        options.color,
        options.intensity,
      );
      this.mainLight.position.set(120, 80, 120);
      this.mainLight.castShadow = true;

      if (this.mainLight instanceof THREE.DirectionalLight) {
        const size = 200;
        this.mainLight.shadow.camera.top = size;
        this.mainLight.shadow.camera.bottom = -size;
        this.mainLight.shadow.camera.left = -size;
        this.mainLight.shadow.camera.right = size;
      }

      this.scene.add(this.mainLight);
    }
  }

  /** 添加方向光辅助线 */
  addMainLightHelper() {
    if (this.mainLight instanceof THREE.DirectionalLight) {
      const dirLightHelper = new THREE.DirectionalLightHelper(
        this.mainLight,
        10,
      );
      this.scene.add(dirLightHelper);
    }
  }

  /** 添加半球光 */
  addHemisphereLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 120, 0);
    this.scene.add(hemiLight);
  }

  /** 添加控制器 */
  addControls(options?: Record<keyof OrbitControls, any>) {
    options = Object.assign(
      {
        enableDamping: true, // 启用阻尼效果
        dampingFactor: 0.1, // 设置阻尼因子
        enablePan: true, // 允许平移
        enableRotate: true, // 允许旋转
        enableZoom: true, // 允许缩放
        rotateSpeed: 1.0,
        zoomSpeed: 1.2,
        panSpeed: 0.8,
        minDistance: 0.1, // 最小距离
        maxDistance: 400, // 最大距离
        // maxPolarAngle: Math.PI / 2, // 限制相机不能翻转到模型后面
        autoRotate: false, // 启用自动旋转
        autoRotateSpeed: 1.0, // 设置自动旋转的速度
      },
      options,
    );
    if (options && !!this.camera) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      for (const key in options) {
        // @ts-ignore
        this.controls[key] = options[key];
      }
    }
  }
}

export default CreateThree;
