import React, { type FC } from 'react';

const ThreeViewer: FC<{ opts?: object; render: Function }> = ({
  opts,
  render,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!render) return;
    const container = containerRef.current;
    if (container && container.children.length === 0) {
      const renderer = render({
        ...opts,
        width: container.offsetWidth,
        container,
      });

      if (!renderer.mount) {
        container.appendChild(renderer.domElement);
      } else {
        renderer.mount(container);
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        transform: 'translateX(0)',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
};

export default ThreeViewer;
