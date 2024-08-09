import React, { type FC } from 'react';
import ThreeViewer from '@/docs/components/ThreeViewer';
import demo from './examples/start/demo';

const App: FC<{}> = () => <ThreeViewer render={demo} opts={{ height: 300 }} />;

export default App;
