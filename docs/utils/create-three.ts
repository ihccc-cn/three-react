import * as THREE from 'three';
import EventEmitter from 'eventemitter3';
// @ts-ignore
import Stats from 'stats.js/src/Stats';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI, Controller } from 'three/examples/jsm/libs/lil-gui.module.min';
import { decimal } from '@ihccc/utils';

export type TGLTFResult = Record<string, GLTF>;

type TLight = {
  color?: THREE.ColorRepresentation;
  intensity?: number;
};

type TConfig = {
  stats?: number;
  width?: number;
  height?: number;
  aspect?: number;
  backgroundColor?: number | string;
  alpha?: number;
  antialias?: boolean;
};

type TOption = {
  stats?: number;
  width: number;
  height: number;
  aspect?: number;
  backgroundColor: number | string;
  alpha: number;
  antialias: boolean;
};

type TGuiOptions = {
  options?: Record<string, any[]>;
  ui: {
    name: string;
    label?: string;
    folder?: string;
    options?: string;
    min?: number;
    max?: number;
    step?: number;
  }[];
};

type TLoadGltfs = {
  path?: string;
  onLoaded?: Function;
  onProgress?: Function;
  onError?: Function;
  onLoadInfo?: Function;
};

const defaultConfig = {
  stats: 0,
  width: 960,
  height: 600,
  backgroundColor: 0x393939,
  alpha: 0.0,
  antialias: true,
};

const Event = {
  /** 画布尺寸发生变化 */
  RESIZE: 'resize',
  /** 挂载 */
  MOUNT: 'mount',
  /** 卸载 */
  UNMOUNT: 'unmount',
  /** 鼠标在画布上移动 */
  MOUSEMOVE: 'mousemove',
  /** 鼠标在画布上按下 */
  MOUSEDOWN: 'mousedown',
};

class CreateThree extends EventEmitter {
  /** 引擎事件 */
  static Event = Event;
  /** 引擎配置 */
  option: TOption;
  /** 渲染器 stats */
  stats?: Stats;
  /** 渲染参数控制器 */
  gui!: Record<string, any>;
  /** 默认渲染器对象 */
  renderer: THREE.WebGLRenderer;
  /** 默认场景对象 */
  scene: THREE.Scene = new THREE.Scene();
  /** 默认时钟对象 */
  clock: THREE.Clock = new THREE.Clock();
  /** 默认摄像机对象，需要调用相关方法添加 */
  camera: null | THREE.PerspectiveCamera = null;
  /** 默认环境光源对象，需要调用相关方法添加 */
  mainLight: null | THREE.AmbientLight | THREE.DirectionalLight | THREE.Light =
    null;
  /** 默认地面对象，需要调用相关方法添加 */
  ground: null | THREE.Mesh = null;
  /** 默认地面网格对象，需要调用相关方法添加 */
  grid: null | THREE.GridHelper = null;
  /** 默认鼠标控制器对象，需要调用相关方法添加 */
  controls: null | OrbitControls = null;
  /** 挂载画布的容器节点 */
  container: null | HTMLDivElement = null;

  _resize: any;
  _mousemove: any;
  _mousedown: any;

  constructor(option?: TConfig) {
    super();
    this.option = Object.assign({}, defaultConfig, option);
    const { stats, width, height, backgroundColor, alpha, antialias } =
      this.option;

    this.renderer = new THREE.WebGLRenderer({ antialias });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(backgroundColor, alpha);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    if (typeof stats === 'number' && stats > -1) {
      this.stats = new Stats();
      this.stats.showPanel(stats); // 0: fps, 1: ms, 2: mb, 3+: custom
    }

    this._resize = this.onResize.bind(this);
    this._mousemove = this.onMousemove.bind(this);
    this._mousedown = this.onMousedown.bind(this);
  }

  /** 初始化 Three 引擎 */
  static init(option?: TConfig) {
    return new CreateThree(option);
  }

  /** 画面尺寸变化回调 */
  onResize() {
    if (!this.container) return;
    this.option.width = Math.floor(this.container.offsetWidth);
    this.option.height = Math.floor(this.container.offsetHeight);
    this.option.aspect = this.option.width / this.option.height;
    if (this.camera) {
      this.camera.aspect = this.option.aspect;
      this.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(this.option.width, this.option.height);
    this.renderer.domElement.width = this.option.width;
    this.renderer.domElement.height = this.option.height;
    this.emit(Event.RESIZE, this.option);
  }

  /** 鼠标在画布上移动的回调 */
  onMousemove(event: MouseEvent) {
    this.emit(Event.MOUSEMOVE, event);
  }

  /** 鼠标在画布上点击的回调 */
  onMousedown(event: MouseEvent) {
    this.emit(Event.MOUSEDOWN, event);
  }

  /** 挂载回调，添加 dom 节点，监听事件等 */
  mount(container: HTMLDivElement) {
    if (!!this.stats) container.appendChild(this.stats.dom);
    if (!!this.gui && !this.gui.mounted) {
      container.appendChild(this.gui.dom);
      this.gui.mounted = true;
    }
    container.appendChild(this.renderer.domElement);
    this.container = container;

    window.addEventListener('resize', this._resize);
    this.renderer.domElement.addEventListener('mousemove', this._mousemove);
    this.renderer.domElement.addEventListener('mousedown', this._mousedown);

    this.emit(Event.MOUNT);
  }

  /** 卸载回调 */
  unmount() {
    window.removeEventListener('resize', this._resize);
    this.renderer.domElement.removeEventListener('mousemove', this._mousemove);
    this.renderer.domElement.removeEventListener('mousedown', this._mousedown);
    this.emit(Event.UNMOUNT);
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

  /** 在场景中添加透视相机 */
  addPerspectiveCamera() {
    const { width, height } = this.option;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100000);
    this.camera.position.set(40, 40, 40);
    this.scene.add(this.camera);
  }

  /** 在场景中添加地面 */
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

  /** 在场景中添加地面网格 */
  addGroundGrid() {
    this.grid = new THREE.GridHelper(600, 20, 0x000000, 0x000000);
    this.grid.position.y = 0.1;
    this.grid.material.opacity = 0.2;
    this.grid.material.transparent = true;
    this.scene.add(this.grid);
  }

  /** 在场景中添加雾效 */
  addFog() {
    this.scene.background = new THREE.Color(0xd9d9d9);
    this.scene.fog = new THREE.Fog(0xd9d9d9, 160, 600);
  }

  /** 在场景中添加环境光 */
  addAmbientLight(options?: TLight) {
    options = Object.assign({ color: 0xffffff, intensity: 4 }, options);
    this.mainLight = new THREE.AmbientLight(options.color, options.intensity); // 浅灰色，强度为2
    this.scene.add(this.mainLight);
  }

  /** 在场景中添加方向光 */
  addDirectionalLight(options?: TLight) {
    options = Object.assign({ color: 0xffffff, intensity: 2 }, options);
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

  /** 在场景中添加方向光辅助线 */
  addMainLightHelper() {
    if (this.mainLight instanceof THREE.DirectionalLight) {
      const dirLightHelper = new THREE.DirectionalLightHelper(
        this.mainLight,
        10,
      );
      this.scene.add(dirLightHelper);
    }
  }

  /** 在场景中添加半球光 */
  addHemisphereLight() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 120, 0);
    this.scene.add(hemiLight);
  }

  /** 在场景中添加坐标轴辅助线：红（X轴）、绿（Y轴）、蓝（Z轴） */
  addAxesHelper(size?: number) {
    const axesHelper = new THREE.AxesHelper(size);
    this.scene.add(axesHelper);
  }

  /** 添加摄像机鼠标控制器 */
  addControls(options?: Partial<OrbitControls>) {
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

  /**
   * 添加渲染参数控制器
   * @param values 控制值
   * @param guiOptions ui 配置
   * @param guiConfig 容器配置
   *
   * @example
   * const values: {
   *   speed: 0.5, // 滑动条
   *   input: 'name', // 输入框
   *   enabled: false, // 复选框
   *   mode: 'auto', // 下拉框
   *   button: () => {}, // 操作按钮
   * };
   *
   * const GUI_OPTIONS = {
   *   options: { modes: ['auto', 'manual'] },
   *   ui: [
   *    { folder: 'folder 1', label: 'Speed', name: 'speed', min: 0.0, max: 10.0 },
   *    { folder: 'folder 1', label: 'Input', name: 'input' },
   *    { folder: 'folder 2', label: 'Enabled', name: 'enabled' },
   *    { folder: 'folder 2', label: 'Mode', name: 'mode', options: 'modes' },
   *    { label: 'Button', name: 'button' },
   *   ]
   * };
   *
   * engine.addGui(values, GUI_OPTIONS);
   */
  addGui(
    values: Record<string, any>,
    guiOptions: TGuiOptions,
    guiConfig?: {
      autoPlace?: boolean;
      container?: HTMLElement;
      width?: number;
      title?: string;
      injectStyles?: boolean;
      touchStyles?: number;
      parent?: GUI;
    },
  ) {
    if (!!this.gui) return;
    const dom = document.createElement('div');
    dom.style.setProperty('position', 'fixed');
    dom.style.setProperty('right', '0px');
    const panel = new GUI({ width: 240, container: dom, ...guiConfig });
    // 分组列表
    const folder: Record<string, GUI> = {};
    const controller: Record<string, Controller> = {};
    // 创建分组
    guiOptions.ui.forEach((item) => {
      if (item.folder && !folder[item.folder]) {
        folder[item.folder] = panel.addFolder(item.folder);
      }
    });
    // 创建控制组件
    guiOptions.ui.forEach((item) => {
      const group = !item.folder ? panel : folder[item.folder];
      const uiArgs = !item.options
        ? [item.min, item.max, item.step]
        : [(guiOptions.options || {})[item.options]];
      controller[item.name] = group.add(values, item.name, ...(uiArgs as any));
      if (item.label) controller[item.name].name(item.label);
    });

    let mounted = false;
    if (!!this.container) {
      this.container.appendChild(dom);
      mounted = true;
    }

    this.gui = {
      dom,
      panel,
      folder,
      controller,
      mounted,
    };
  }

  /**
   * 批量加载 GLTF 模型
   * @param assets gltf 文件路径列表
   * @param config.path 统一路径，eg: `/path/gltf/{name}.gltf`
   * @param config.onLoaded 所有模型文件加载完成回调
   * @param config.onLoadInfo 模型加载信息回调
   */
  loadGltfs(assets: any, config: TLoadGltfs) {
    const { path, onLoaded, onProgress, onError, onLoadInfo } = config;

    const models: TGLTFResult = {};
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);

    assets.forEach((name: string) => {
      const url = !path ? name : path.replace('{name}', name);
      loader.load(
        url,
        (gltf: GLTF) => {
          models[name] = gltf;
          if (Object.keys(models).length === assets.length) onLoaded?.(models);
        },
        (event: ProgressEvent<EventTarget>) => {
          let progress = -1;
          if (event.total > 0) {
            progress = decimal((event.loaded / event.total) * 100, 1);
          }
          onProgress?.(name, progress);
          onLoadInfo?.({
            type: 'loading',
            title: `正在加载模型 - ${name}`,
            progress,
          });
        },
        (event: ErrorEvent) => {
          onError?.(event);
          onLoadInfo?.({ type: 'error', title: `加载模型出错 - ${name}` });
        },
      );
    });
  }
}

export default CreateThree;
