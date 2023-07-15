import React, { type FC } from "react";

const ThreeViewer: FC<{ opts?: object, render: Function }> = ({ opts, render }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!render) return;
    const container = containerRef.current;
    if (container && container.children.length === 0) {
      const renderer = render({ ...opts, width: container.offsetWidth, container });
      container.appendChild(renderer.domElement);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }}></div>
  );
};

export default ThreeViewer;
