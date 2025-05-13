import React, { type FC } from 'react';
import * as THREE from 'three';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../utils/create-three';

function demo(opts: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addGround();
  engine.addGroundGrid();
  engine.addFog();
  engine.addDirectionalLight();
  engine.addHemisphereLight();
  engine.addAxesHelper();
  engine.addControls();

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(0, 5, 10),
    new THREE.Vector3(10, 0, 0),
  ]);
  const points = curve.getPoints(500); // 将路径分割为500个点

  let progress = 0;

  engine.start(() => {
    // if (progress < 1) {
    //   console.log(progress);
    //   const currentPoint = curve.getPointAt(progress);
    //   const nextPoint = curve.getPointAt(progress + 0.05);
    //   // 设置相机位置并朝向下一路径点
    //   engine.camera!.position.copy(currentPoint);
    //   engine.camera!.lookAt(nextPoint);
    //   progress += 0.0005; // 控制移动速度
    // }
  });

  return engine;
}

const App: FC<{}> = () => <ThreeViewer render={demo} />;

export default App;
