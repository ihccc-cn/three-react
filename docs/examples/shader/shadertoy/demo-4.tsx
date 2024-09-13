import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import * as THREE from 'three';
import CreateThree from '../../../utils/create-three';

function demo(opts?: Record<string, any>) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight();
  engine.addControls();

  engine.camera?.position.set(0, 1.5, 0);

  const { width, height } = engine.renderer.getDrawingBufferSize(
    new THREE.Vector2(),
  );

  const uniforms = {
    iResolution: { value: new THREE.Vector2(width, height) }, // 屏幕分辨率（像素）
    iTime: { value: 0.0 }, // 播放时间（秒）
    iChannel0: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
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
    varying vec2 vUv;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec3 iChannel0;
    /* "Disco Godrays" by @kishimisu (2023) - https://www.shadertoy.com/view/Dt33RS
    [68 chars shorter thanks to the amazing shadertoy community!]

    These are "fake" godrays made without tracing any additional ray.
    The maximum raymarching step size is set to 0.1 in order to sample the scene
    frequently (very inneficient) and some blue noise is added to reduce artefacts.
    */

    #define M(p) p *= mat2(cos(round((atan(p.x,p.y)+k)/.3)*.3-k + vec4(0,33,11,0)));//
    #define S cos( k - t + vec4(0,.5,1,0)) * smoothstep( 1., 0.//
    #define L length(p

    void main() {
      float i = .0, t = i, d=.3, k = iTime*d, l;
      // for (gl_FragColor *= i; i++ < 60. && d > .01; t -= d = min(max(l,-d), .1 + texture(iChannel0, gl_FragCoord/1024.).r*.06) ) {
      for (gl_FragColor *= i; i++ < 60. && d > .01; t -= d = min(max(l,-d), .1 + .06) ) {
          vec3 R = iResolution, p = R-vec2(gl_FragCoord + gl_FragCoord,R.y);
          p = t/L)*p-2./R;
          M(p.zx) M(p.yx)
          gl_FragColor +=  S, (d = L.yz) -.05) / .02) * S, l = L) - 1.) + .002;
      }
      gl_FragColor *= exp(t*.1);
    }
  `;

  const shader = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shader);
  plane.rotateX(Math.PI / -2);
  engine.scene.add(plane);

  engine.start(() => {
    shader.uniforms.iTime.value += 0.01;
  });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
