import React, { type FC } from 'react';
// import * as THREE from 'three';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../../utils/create-three';
import CreateSceneTour from '../../../../utils/create-scene-tour';
import type { TSceneData } from '../../../../utils/create-scene-tour';

const sceneData: TSceneData = {
  defaultSceneIndex: 0,
  scenes: [
    {
      name: '1',
      texture: '/image/billiard_hall.webp',
    },
    {
      name: '2',
      texture: '/image/blocky_photo_studio.webp',
      x: 1,
    },
    {
      name: '3',
      texture: '/image/brown_photostudio_02.webp',
      x: 2,
    },
    {
      name: '4',
      texture: '/image/christmas_photo_studio_07.webp',
      x: -1,
    },
    {
      name: '5',
      texture: '/image/mirrored_hall.webp',
      x: -1,
      z: -1,
    },
    {
      name: '6',
      texture: '/image/photo_studio_01.webp',
      z: 1,
    },
    {
      name: '7',
      texture: '/image/rostock_laage_airport.webp',
      z: -1,
    },
    {
      name: '8',
      texture: '/image/small_empty_room_1.webp',
      y: 1,
    },
    {
      name: '9',
      texture: '/image/small_empty_room_3.webp',
      y: -1,
    },
    {
      name: '10',
      texture: '/image/warm_restaurant_night.webp',
      y: -2,
    },
  ],
};

const GUI_VALUES: {
  sceneIndex: number;
} = {
  sceneIndex: 1,
};

const GUI_OPTIONS = {
  ui: [{ label: '场景', name: 'sceneIndex', min: 1, max: 10, step: 1 }],
};

function demo(opts: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 4 });
  engine.addControls({ enablePan: false });

  engine.camera!.position.set(0, 0, 0.1);

  engine.addGui(GUI_VALUES, GUI_OPTIONS, { title: '播放参数' });
  const gui = engine.gui.controller;

  const sceneTour = new CreateSceneTour(sceneData);

  gui.sceneIndex.onChange((sceneIndex: number) => {
    sceneTour.change(sceneIndex);
  });

  sceneTour.on('load', (scene: any) => {
    engine.scene.add(scene);
  });

  sceneTour.on('change', (room: any) => {
    const position = room.position;
    engine.camera!.position.copy(position);
    engine.camera!.position.z += 0.1;
    engine.camera!.lookAt(position);
    engine.controls!.target.copy(position);
    engine.controls!.update();
  });

  engine.start();

  return engine;
}

const App: FC<{}> = () => <ThreeViewer render={demo} />;

export default App;
