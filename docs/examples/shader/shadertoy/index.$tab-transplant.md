---
title: Shadertoy 着色器移植
order: 2

nav:
  title: 示例
  order: 1
  second: Shader 着色器

group: 简单上手

demo:
  cols: 2
---

## 移植 `shadertoy` 着色器代码步骤

- 顶点着色器代码保持默认

  ```js
  const vertexShader = `
    varying vec2 vUv;
    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  ```

- 片元着色器代码写入 `shadertoy` 代码
- 修改主方法名称 `mainImage` 为 `main`
- 去除 `main` 方法的 `fragColor`、`fragCoord` 参数
- 修改方法内 `fragColor` 变量为 `gl_FragColor`
- 修改方法内 `fragCoord` 变量为 `gl_FragCoord`
- 视情况调整 `uv` 变量为 `vUv`，并在片元着色器顶部声明 `varying vec2 vUv;`
- 将 `shadertoy` 中的着色器输入定义修改为 three 中 `uniforms` 的参数，声明需要的即可

  `shadertoy` 着色器输入
  ```glsl
  uniform vec3      iResolution;           // viewport resolution (in pixels)
  uniform float     iTime;                 // shader playback time (in seconds)
  uniform float     iTimeDelta;            // render time (in seconds)
  uniform float     iFrameRate;            // shader frame rate
  uniform int       iFrame;                // shader playback frame
  uniform float     iChannelTime[4];       // channel playback time (in seconds)
  uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
  uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
  uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
  uniform vec4      iDate;                 // (year, month, day, time in seconds)
  ```

  定义 `uniforms`

  ```js
  const { width, height } = renderer.getDrawingBufferSize(
    new THREE.Vector2(),
  );

  const uniforms = {
    iResolution: { value: new THREE.Vector3(width, height) }, // 画布分辨率（像素）
    iTime: { value: 0.0 }, // 播放时间（秒）
    iTimeDelta: { value: 0.0 }, // 渲染时间
    iFrameRate: { value: 60.0 }, // shader 帧速率
    iFrame: { value: 0 }, // shader 帧数
    iChannelTime: { value: [0.0, 0.0, 0.0, 0.0] }, // channel playback time (in seconds)
    iChannelResolution: { value: [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ] }, // channel resolution (in pixels)
    iMouse: { value: new THREE.Vector4() },      // 鼠标位置坐标（像素）
    // iChannel0..3 需要根据实际情况替换为具体的纹理或立方体贴图
    // iDate 需要手动设置，可能需要自定义函数来获取当前日期时间
  };
  ```

- 在渲染方法中更新 `uniforms` 参数

  ```js
  // 假设你有一个渲染循环
  function render() {
    const currentTime = performance.now() * 0.001; // 时间以秒为单位
    const frame = 0; // 假设帧数
    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const mouse = new THREE.Vector4(0, 0, 0, 0); // 示例鼠标位置

    shader.uniforms.iTime.value = currentTime;
    shader.uniforms.iFrame.value = frame;
    shader.uniforms.iResolution.value.set(resolution.x, resolution.y, 0);
    shader.uniforms.iMouse.value.set(mouse.x, mouse.y, mouse.z, mouse.w);
  }

  // 或者通过渲染回调更新 uniforms 值
  model.onBeforeRender = () => {
    shader.uniforms.iTime.value += 0.01;
  };
  ```

- 在片元着色器顶部声明`uniform` 变量

  ```glsl
  uniform vec3 iResolution;
  uniform float iTime;
  ```
