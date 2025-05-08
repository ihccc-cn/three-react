import * as THREE from 'three';
import CreateThree from './create-three';

type TUniforms = {
  /** 屏幕分辨率（像素） */
  iResolution?: { value: THREE.Vector2 };
  /** 播放时间（秒） */
  iTime?: { value: number };
  iTimeDelta?: { value: number };
  iFrame?: { value: number };
  iMouse?: { value: THREE.Vector4 };
  iDate?: { value: number };
  iChannel0?: { value: THREE.DataTexture };
  iChannel1?: { value: THREE.DataTexture };
  iChannel2?: { value: THREE.DataTexture };
  iChannel3?: { value: THREE.DataTexture };
};

type TChannelAudio = {
  type: 'audio';
  audioSrc?: string;
  loop?: boolean;
  fftSize: number;
};

type TChannels = TChannelAudio[];

function createChannelAudioTexture(channel: TChannelAudio): any {
  const listener = new THREE.AudioListener();
  const audio = new THREE.Audio(listener);

  const audioPlayer = new Audio(channel.audioSrc);
  audioPlayer.loop = !!channel.loop;
  if (!!channel.audioSrc) audioPlayer.play();

  audio.setMediaElementSource(audioPlayer);
  const analyser = new THREE.AudioAnalyser(audio, channel.fftSize);

  // JavaScript 中创建数据纹理
  const audioTexture = new THREE.DataTexture(
    analyser.data, // 数据数组
    (channel.fftSize || 256) / 2,
    1, // 宽度、高度（1D 纹理）
    THREE.RedFormat,
  );

  return { ...channel, audioPlayer, analyser, audioTexture };
}

/** 创建 channel */
function createChannels(uniforms: TUniforms, channels?: TChannels): any[] {
  if (!channels || channels.length === 0) return [];
  return channels.reduce((list, channel, i) => {
    if (channel.type === 'audio') {
      const handler = createChannelAudioTexture(channel);
      // 创建频率数据容器
      uniforms[('iChannel' + i) as 'iChannel0'] = {
        value: handler.audioTexture,
      };
      return list.concat(handler);
    }
    return list;
  }, []);
}

/** 创建 uniforms */
function createUniforms(width: number, height: number): TUniforms {
  return {
    iResolution: { value: new THREE.Vector2(width, height) },
    iTime: { value: 0.0 },
    iTimeDelta: { value: 0.0 },
    iFrame: { value: 1 },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    iDate: { value: Date.now() },
  };
}

/** 创建 ShaderMaterial */
function createShadertoyShader(
  shadertoy: string,
  uniforms: TUniforms,
): THREE.ShaderMaterial {
  // 默认顶点着色器
  const vertexShader = `
    varying vec2 vUv;
    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iTime;                 // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    // uniform float     iFrameRate;            // shader frame rate
    uniform int       iFrame;                // shader playback frame
    // uniform float     iChannelTime[4];       // channel playback time (in seconds)
    // uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
    // uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
    uniform sampler2D iChannel0; // 主音频纹理
    uniform vec4      iDate;                 // (year, month, day, time in seconds)

    ${shadertoy
      .replace(/fragColor/g, 'gl_FragColor')
      // .replace(/fragCoord/g, 'gl_FragCoord.xy')
      .replace(
        /void\s+mainImage\(.+\)\s+?\{/,
        'void main(){ vec2 fragCoord = gl_FragCoord.xy;',
      )}
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  return material;
}

/** 创建渲染面板 */
export function createShadertoyPlane(
  material: THREE.ShaderMaterial,
): THREE.Mesh {
  const aspect = window.innerWidth / window.innerHeight;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(aspect * 2, 2),
    material,
  );
  plane.rotateX(Math.PI / -2);
  return plane;
}

function createShadertoy(
  engine: CreateThree,
  shadertoy: string,
  channels?: TChannels,
): {
  getChannel: () => any[];
  change: (shadertoy: string) => void;
  start: () => void;
  stop: () => void;
} {
  const { width, height } = Object.assign(
    { width: 512, height: 512 },
    engine.option,
  );
  const uniforms = createUniforms(width, height);

  const material = createShadertoyShader(shadertoy, uniforms);

  const channelhandlers = createChannels(uniforms, channels);

  const shadertoyShader = { uniforms, material, channelhandlers };

  const plane = createShadertoyPlane(shadertoyShader.material);

  engine.scene.add(plane);

  engine.addPerspectiveCamera();
  engine.camera?.position.set(0, 1.5, 0);
  engine.camera?.lookAt(plane.position);

  const start = () => {
    const clock = new THREE.Clock();

    engine.start(() => {
      const material = shadertoyShader.material;
      const channelhandlers = shadertoyShader.channelhandlers;
      // material.uniforms.iTime.value += 0.01;
      material.uniforms.iTime.value = clock.getElapsedTime();
      material.uniforms.iTimeDelta.value = clock.getDelta();
      // material.uniforms.iFrameRate.value =
      material.uniforms.iFrame.value += 1;
      material.uniforms.iDate.value = Date.now();

      channelhandlers.forEach((channel) => {
        if (channel.type === 'audio') {
          channel.analyser.getFrequencyData();
          material.uniforms.iChannel0.value.needsUpdate = true;
        }
      });
    });
  };

  const stop = () => {
    const channelhandlers = shadertoyShader.channelhandlers;
    channelhandlers.forEach((channel) => {
      if (channel.type === 'audio') {
        channel.audioPlayer.pause();
        channel.audioPlayer.src = '';
      }
    });
  };

  const getChannel = () => shadertoyShader.channelhandlers;

  const change = (shader: string) => {
    const newMaterial = createShadertoyShader(shader, uniforms);
    Object.assign(shadertoyShader, { material: newMaterial });
    plane.material = newMaterial;
  };

  engine.on(CreateThree.Event.RESIZE, (option: any) => {
    shadertoyShader.material.uniforms.iResolution.value.set(
      option.width,
      option.height,
    );
  });

  engine.on(CreateThree.Event.UNMOUNT, stop);

  engine.renderer.domElement.addEventListener('mousemove', (e) => {
    const material = shadertoyShader.material;
    material.uniforms.iMouse.value.x = e.clientX;
    material.uniforms.iMouse.value.y = window.innerHeight - e.clientY;
  });

  engine.renderer.domElement.addEventListener('mousedown', (e) => {
    const material = shadertoyShader.material;
    material.uniforms.iMouse.value.z = e.clientX;
    material.uniforms.iMouse.value.w = window.innerHeight - e.clientY;
  });

  return { getChannel, change, start, stop };
}

export default createShadertoy;
