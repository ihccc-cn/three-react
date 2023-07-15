import React, { type FC } from "react";
import ThreeViewer from "../../components/ThreeViewer";
import demo from "./demo";

const App: FC<{}> = () => <ThreeViewer render={demo} />;

export default App;
