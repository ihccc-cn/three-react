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
    #define green vec3(0.0,.3,0.6)

    varying vec2 vUv;
    uniform vec3 iResolution;
    uniform float iTime;

    // returns a vec3 color from every pixel requested.
    // Generates a BnW Ping on normalized 2d coordinate system
    vec3 RadarPing(
      in vec2 uv,
      in vec2 center,
      in float innerTail,
      in float frontierBorder,
      in float timeResetSeconds,
      in float radarPingSpeed,
      in float fadeDistance,
      float t
    ) {
      vec2 diff = center-uv;
      float r = length(diff);
      float time = mod(t, timeResetSeconds) * radarPingSpeed;

      float circle;
      // r is the distance to the center.
      // circle = BipCenter---//---innerTail---time---frontierBorder
      //illustration
      //https://sketch.io/render/sk-14b54f90080084bad1602f81cadd4d07.jpeg
      circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
      circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance

      return vec3(circle);
    }

    void main() {
      //normalize coordinates
      // vec2 uv = gl_FragCoord.xy / iResolution.xy; //move coordinates to 0..1
      // uv = uv.xy*2.; // translate to the center
      vec2 uv = vUv;
      // uv += vec2(-1.0, -1.0);
      uv += vec2(-0.5, -0.5);
      // uv.x *= iResolution.x/iResolution.y; //correct the aspect ratio

      vec3 color;
      // generate some radar pings
      float fadeDistance = 0.8;
      float resetTimeSec = 3.0;
      float radarPingSpeed = 0.2;
      vec2 greenPing = vec2(0.0, 0.0);
      color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime) * green;
      color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 1.) * green;
      color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 2.) * green;
      //return the new color
      gl_FragColor = vec4(color,1.0);
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

  engine.camera?.position.set(0, 1.5, 0);
  engine.camera?.lookAt(plane.position);

  engine.start(() => {
    shader.uniforms.iTime.value += 0.01;
  });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
