import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import * as THREE from 'three';
import CreateThree from '../../../utils/create-three';

function demo(opts?: Record<string, any>) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight();

  const { width, height } = engine.renderer.getDrawingBufferSize(
    new THREE.Vector2(),
  );

  const uniforms = {
    iResolution: { value: new THREE.Vector2(width, height) }, // 屏幕分辨率（像素）
    iTime: { value: 0.0 }, // 播放时间（秒）
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

    float squared(float value) { return value * value; }

    void main()
    {
      vec2 uvTrue = gl_FragCoord.xy / iResolution.xy;
      vec2 uv = -1.0 + 2.0 * uvTrue;
      // uv.y *= -1;

      float lineIntensity;
      float glowWidth;
      vec3 color = vec3(0.0);

      for(float i = 0.0; i < 5.0; i++) {

        uv.y += (0.2 * sin(uv.x + i/7.0 - iTime * 0.6));
            float Y = uv.y;
            lineIntensity = 0.4 + squared(1.6 * abs(mod(uvTrue.x + i / 1.3 + iTime,2.0) - 1.0));
        glowWidth = abs(lineIntensity / (250.0 * Y));
        color += vec3(glowWidth * (2.0 + sin(iTime * 0.13)),
                          glowWidth * (2.0 - sin(iTime * 0.23)),
                          glowWidth * (2.0 - cos(iTime * 0.19)));
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const shader = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const aspect = window.innerWidth / window.innerHeight;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(aspect * 2, 2), shader);
  plane.rotateX(Math.PI / -2);
  engine.scene.add(plane);

  engine.camera?.position.set(0, 1.5, 0);
  engine.camera?.lookAt(plane.position);

  engine.start(() => {
    shader.uniforms.iTime.value += 0.01;
  });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
