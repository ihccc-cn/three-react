import * as THREE from 'three';
import CreateThree from './create-three';

function createShadertoyShader(
  engine: CreateThree,
  shadertoy: string,
): THREE.ShaderMaterial {
  const { width, height } = engine.option;

  const uniforms = {
    iResolution: { value: new THREE.Vector2(width, height) }, // 屏幕分辨率（像素）
    iTime: { value: 0.0 }, // 播放时间（秒）
    iTimeDelta: { value: 0.0 },
    iFrame: { value: 1 },
    iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
    iDate: { value: Date.now() },
  };

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

export function createShadertoyPlane(
  engine: CreateThree,
  material: THREE.ShaderMaterial,
) {
  const aspect = window.innerWidth / window.innerHeight;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(aspect * 2, 2),
    material,
  );
  plane.rotateX(Math.PI / -2);
  engine.scene.add(plane);

  engine.camera?.position.set(0, 1.5, 0);
  engine.camera?.lookAt(plane.position);

  const clock = new THREE.Clock();

  engine.start(() => {
    // material.uniforms.iTime.value += 0.01;
    material.uniforms.iTime.value = clock.getElapsedTime();
    material.uniforms.iTimeDelta.value = clock.getDelta();
    // material.uniforms.iFrameRate.value =
    material.uniforms.iFrame.value += 1;
    material.uniforms.iDate.value = Date.now();
  });

  engine.on(CreateThree.Event.RESIZE, (option) => {
    material.uniforms.iResolution.value.set(option.width, option.height);
  });

  engine.renderer.domElement.addEventListener('mousemove', (e) => {
    material.uniforms.iMouse.value.x = e.clientX;
    material.uniforms.iMouse.value.y = window.innerHeight - e.clientY;
  });

  engine.renderer.domElement.addEventListener('mousedown', (e) => {
    material.uniforms.iMouse.value.z = e.clientX;
    material.uniforms.iMouse.value.w = window.innerHeight - e.clientY;
  });
}

function createShadertoy(engine: CreateThree, shadertoy: string): CreateThree {
  const shader = createShadertoyShader(engine, shadertoy);
  createShadertoyPlane(engine, shader);
  return engine;
}

export default createShadertoy;
