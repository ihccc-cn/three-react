import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../utils/create-three';
import createShadertoy from '../../../utils/create-shadertoy';
import shadertoy from './shader-0-01.ts';
import shadertoy2 from './shader-0-02.ts';
import shadertoy3 from './shader-0-03.ts';
import shadertoy4 from './shader-0-04.ts';
// import shadertoy5 from './shader-0-05.ts';
import shadertoy6 from './shader-0-06.ts';
// import shadertoy7 from './shader-0-07.ts';
import shadertoy8 from './shader-0-08.ts';
import shadertoy9 from './shader-0-09.ts';
import shadertoy10 from './shader-0-10.ts';
import shadertoy11 from './shader-0-11.ts';

const audios: string[] = [
  'Battle Ready',
  'Black Knight',
  'Dawn of the Apocalypse',
  'Honor Bound',
  'Kings Trailer',
  'New Hero in Town',
  'The Enemy',
];

const shadertoyStyle: Record<string, string> = {
  频闪曲线: shadertoy,
  跳跃色块: shadertoy2,
  炫彩曲线: shadertoy3,
  灵动曲线: shadertoy4,
  // shadertoy5: shadertoy5,
  对称频谱: shadertoy6,
  // shadertoy7: shadertoy7,
  动感音阶: shadertoy8,
  迷幻空间: shadertoy9,
  舞动剧场: shadertoy10,
  寰宇边界: shadertoy11,
};

const GUI_VALUES: {
  audioSrc: string;
  loop: boolean;
  styleKey: keyof typeof shadertoyStyle;
  togglePlay: () => void;
} = {
  audioSrc: audios[0],
  loop: true,
  styleKey: '频闪曲线',
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

  const run = () => {
    engine.addGui(GUI_VALUES, GUI_OPTIONS, { title: '播放参数' });
    const gui = engine.gui.controller;

    const stage = createShadertoy(engine, shadertoyStyle[GUI_VALUES.styleKey], [
      {
        type: 'audio',
        audioSrc: getAudioSrc(GUI_VALUES.audioSrc),
        loop: GUI_VALUES.loop,
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
