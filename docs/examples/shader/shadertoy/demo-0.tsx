import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../utils/create-three';
import createShadertoy from '../../../utils/create-shadertoy';
import shadertoy from './shader-0-01.ts';
import shadertoy2 from './shader-0-02.ts';
import shadertoy3 from './shader-0-03.ts';

const audios = [
  'Battle Ready',
  'Black Knight',
  'Dawn of the Apocalypse',
  'Honor Bound',
  'Kings Trailer',
  'New Hero in Town',
  'The Enemy',
];

const shadertoyStyle: Record<'曲线' | '色块' | '曲线2', string> = {
  曲线: shadertoy,
  色块: shadertoy2,
  曲线2: shadertoy3,
};

const GUI_VALUES = {
  audioSrc: audios[0],
  loop: true,
  styleKey: '曲线',
  togglePlay: () => {},
};

const GUI_OPTIONS = {
  ui: [
    { label: '音频', name: 'audioSrc', options: 'audios' },
    { label: '循环', name: 'loop' },
    { label: 'Shader 样式', name: 'styleKey', options: 'shadertoyStyleKeys' },
    { label: '播放/暂停', name: 'togglePlay' },
  ],
  options: {
    audios,
    shadertoyStyleKeys: Object.keys(shadertoyStyle),
  },
};

const getAudioSrc = (name: string): string =>
  `${window.location.origin}/audio/{name}.mp3`.replace('{name}', name);

function demo(opts: Record<string, any>, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  engine.addGui(GUI_VALUES, GUI_OPTIONS, { title: '播放参数' });
  const gui = engine.gui.controller;

  const run = () => {
    const stage = createShadertoy(engine, shadertoy, [
      {
        type: 'audio',
        audioSrc: getAudioSrc(GUI_VALUES.audioSrc),
        fftSize: 512,
      },
    ]);

    GUI_VALUES.togglePlay = () => {
      const audioPlayer = stage.getChannel()[0]?.audioPlayer;
      if (audioPlayer) audioPlayer[audioPlayer.paused ? 'play' : 'pause']();
    };

    gui.audioSrc.onChange((audioSrc: string) => {
      const audioPlayer = stage.getChannel()[0]?.audioPlayer;
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.src = getAudioSrc(audioSrc);
        audioPlayer.load();
        audioPlayer.play();
      }
    });

    gui.loop.onChange((loop: string) => {
      const audioPlayer = stage.getChannel()[0]?.audioPlayer;
      if (audioPlayer) audioPlayer.loop = loop;
    });

    gui.styleKey.onChange((styleKey: keyof typeof shadertoyStyle) => {
      stage.change(shadertoyStyle[styleKey]);
    });

    stage.start();
    setViewInfo(null);
  };

  setViewInfo({
    type: 'start',
    title: '点击开始运行',
    callback: run,
  });

  return engine;
}

const App = () => <ThreeViewer render={demo} />;

export default App;
