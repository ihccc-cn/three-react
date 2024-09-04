import React, { type FC } from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
// import demo from './examples/start/demo';
import { demo } from './examples/model/gltf-character/animation';

const App: FC<{}> = () => (
  <ThreeViewer render={demo} opts={{ stats: -1, height: 400 }} />
);

export default App;
