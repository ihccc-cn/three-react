import React from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import CreateThree from '../../../utils/create-three';
import createShadertoy from '../../../utils/create-shadertoy';
import shadertoy from './shader-2.ts';

function demo(opts: Record<string, any>, setViewInfo: Function) {
  const engine = CreateThree.init({ ...opts });

  const run = () => {
    const stage = createShadertoy(engine, shadertoy);

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
