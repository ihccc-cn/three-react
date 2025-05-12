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
      place: 'Center',
      index: 0,
    },
    {
      name: '2',
      texture: '/image/blocky_photo_studio.webp',
      place: 'Left',
      index: 0,
    },
    {
      name: '3',
      texture: '/image/brown_photostudio_02.webp',
      place: 'Left',
      index: 1,
    },
    {
      name: '4',
      texture: '/image/christmas_photo_studio_07.webp',
      place: 'Right',
      index: 0,
    },
    {
      name: '5',
      texture: '/image/mirrored_hall.webp',
      place: 'Right',
      index: 1,
    },
    {
      name: '6',
      texture: '/image/photo_studio_01.webp',
      place: 'Front',
      index: 0,
    },
    {
      name: '7',
      texture: '/image/rostock_laage_airport.webp',
      place: 'Back',
      index: 0,
    },
    {
      name: '8',
      texture: '/image/small_empty_room_1.webp',
      place: 'Top',
      index: 0,
    },
    {
      name: '9',
      texture: '/image/small_empty_room_3.webp',
      place: 'Down',
      index: 0,
    },
    {
      name: '10',
      texture: '/image/warm_restaurant_night.webp',
      place: 'Down',
      index: 1,
    },
  ],
};

const GUI_VALUES: {
  sceneIndex: number;
} = {
  sceneIndex: 0,
};

const GUI_OPTIONS = {
  ui: [{ label: '场景', name: 'sceneIndex' }],
};

function demo(opts: object) {
  const engine = CreateThree.init({ ...opts });

  engine.addPerspectiveCamera();
  engine.addAmbientLight({ intensity: 4 });
  engine.addControls();

  engine.camera?.position.set(0, 0, 0.1);

  const sceneTour = new CreateSceneTour(sceneData);

  sceneTour.on('load', (scene: any) => {
    engine.addGui(GUI_VALUES, GUI_OPTIONS, { title: '播放参数' });
    const gui = engine.gui.controller;

    gui.sceneIndex.onChange((sceneIndex: number) => {
      sceneTour.change(sceneIndex);
    });

    engine.scene.add(scene);
  });

  engine.start();

  return engine;
}

const App: FC<{}> = () => <ThreeViewer render={demo} />;

export default App;
