---
nav:
  title: 示例
  order: 1
  second: Shader 着色器
group:
  title: Shader 基础
  order: 0
title: Shader 宏、变量
order: 0
demo:
  cols: 2
---


## Shader 宏、变量

### 使用 `#define` 指令声明常量

适用于全局静态值

```glsl
#define PI 3.1415926535
#define MAX_STEPS 100
```

通过 `ShaderMaterial` 的 `defines` 属性动态注入宏：

```js
const material = new THREE.ShaderMaterial({
  defines: {
    USE_TEXTURE: true,  // 条件编译开关
    TILE_SIZE: 10.0     // 数值型常量
  }
});
```

可用于控制代码分支（如 `#ifdef USE_TEXTURE`）或动态配置参数

### 变量类型​

1. ​​基本数据类型​

  - *​标量​*​：`float`、`int`、`bool`（如 float time = 1.0;）
  - *向量​*​：`vec2` / `vec3` / `vec4`（坐标、颜色），`ivec2`（整数向量），`bvec3`（布尔向量）
  - ​*​矩阵*​​：`mat3`（3x3 矩阵）、`mat4`（变换矩阵）

2. ​​特殊变量​
  - `attribute`
  
    仅顶点着色器可用，表示几何体属性（如位置、法线）：

    ```glsl
    attribute vec3 position;  // 自动绑定到几何体的顶点数据
    ```
  - `varying`
  
    用于顶点着色器向片元着色器传递插值数据：

    ```glsl
    varying vec2 vUv;        // 传递 UV 坐标
    varying float vIntensity; // 传递光照强度
    ```
  - `uniform`

    全局变量，由 `JavaScript` 传入

### `uniform` 的使用​

1. ​​定义与传值​​

  通过 `ShaderMaterial` 的 `uniforms` 属性声明，支持动态更新：

  ```js
  const uniforms = {
    iTime: { value: 0 },                   // 浮点数
    iResolution: { value: new THREE.Vector2() }, // 二维向量
    uTexture: { value: new THREE.Texture() }      // 纹理
  };

  const material = new THREE.ShaderMaterial({ uniforms });
  ```

2. ​​在着色器中访问​

  ```glsl
  // 顶点着色器
  uniform mat4 modelMatrix;     // 模型矩阵（Three.js 自动传入）
  uniform float iTime;          // 自定义时间变量

  // 片元着色器
  uniform sampler2D uTexture;  // 纹理
  uniform vec3 uColor;          // 自定义颜色
  ```

3. ​​动态更新​

  在渲染循环中修改 `uniform` 值以实现动画：

  ```js
  function animate() {
    material.uniforms.iTime.value += 0.01;
    renderer.render(scene, camera);
  }
  ```

### 对比

| 类型        | 作用域          | 生命周期       | 典型用途                     |
| :---------- | :-------------- | :------------- | :--------------------------- |
| `#define`   | 全局            | 编译时替换     | 数学常量、条件编译           |
| `uniform`   | 全局（CPU→GPU） | 渲染周期内有效 | 动态参数（时间、纹理、矩阵） |
| `attribute` | 顶点着色器      | 逐顶点         | 几何体原始数据（位置、UV）   |
| `varying`   | 顶点→片元       | 插值计算       | 传递光照、UV 等插值数据      |
