import * as THREE from 'three';
import random from '@ihccc/utils/lib/random';
import CreateThree from '../../../utils/create-three';
import getLocationXYZ from '../../../utils/getLocationXYZ';

type TCube = {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  material?: any;
};

const locations = [
  '120.370315,31.496916',
  '120.38247,31.486998',
  '120.392459,31.495003',
  '120.394686,31.481947',
  '120.381392,31.475726',
  '120.371474,31.494757',
  '120.36745,31.48515',
  '120.37169,31.47665',
  '120.356958,31.489399',
  '120.402232,31.481085',
  '120.361341,31.482686',
  '120.376505,31.500484',
  '120.398855,31.503932',
  '120.41718,31.488722',
  '120.418114,31.499191',
  '120.419408,31.477636',
  '120.400148,31.496974',
  '120.389297,31.505225',
  '120.368204,31.511983',
];

function demo(opts?: Record<string, any>) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addGround();
  engine.addGroundGrid();
  engine.addFog();
  engine.addDirectionalLight();
  engine.addHemisphereLight();
  engine.addControls();

  const materialList = [new THREE.MeshBasicMaterial({ color: 0x797979 })];

  const createCube = (cubeVal: TCube) => {
    const { position, width, height, depth, material } = cubeVal || {};
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(...(position || [0, 0, 0]));
    cube.translateY((height ?? 0) / 2);
    cube.castShadow = true; // default is false
    engine.scene.add(cube);
    return cube;
  };

  const buildings = locations.map((loc) => {
    const [lng, lat] = loc.split(',');
    const position = getLocationXYZ({ lng: +lng, lat: +lat }, 12);
    return createCube({
      position,
      width: random(1, 2),
      height: random(3, 6),
      depth: random(1, 2),
      material: random(materialList),
    });
  });

  const shader = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;

      void main () {
        vUv = uv;

        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float scale;
      uniform vec3 color1;
      uniform vec3 color2;

      void main () {

        float dis = distance(vUv, vec2(0.5, 0.5));

        float opacity = smoothstep(0.4 * scale, 0.5 * scale, dis);

        opacity *= step(dis, 0.5 * scale);

        opacity -= (scale - 0.8) * 5. * step(0.8, scale);

        vec3 disColor = color1 - color2;

        vec3 color = color2 + disColor * scale;

        gl_FragColor = vec4(color, opacity);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      scale: { value: 0 },
      color1: { value: new THREE.Color('#FF5722') },
      color2: { value: new THREE.Color('#FFEB3B') },
    },
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), shader);
  plane.position.set(-30, 0, 0);
  plane.rotateX(Math.PI / -2);
  engine.scene.add(plane);

  engine.start(() => {
    shader.uniforms.scale.value += 0.01;
    shader.uniforms.scale.value %= 1;
  });

  return engine;
}

export default demo;
