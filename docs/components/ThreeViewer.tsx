import React, { type FC } from 'react';
import './index.less';

const useMountThreeRef = (render: Function, opts?: Record<string, any>) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [info, setInfo] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (!render) return;
    const container = containerRef.current;

    const run = async () => {
      // 防止热更新被插入多次
      if (!container || container.children.length > 0) return;
      const renderer = render(
        {
          ...opts,
          ...(window.location.pathname.indexOf('~demos') > 0
            ? { height: window.innerHeight }
            : {}),
          width: container.offsetWidth,
          container,
        },
        setInfo,
      );

      if (!renderer.mount) {
        container.appendChild(renderer.domElement);
      } else {
        renderer.mount(container);
      }
    };

    run();
  }, []);

  return { ref: containerRef, info };
};

const Loading: FC<{ title: string; progress: number }> = ({
  title,
  progress,
}) => {
  return (
    <div className="loading">
      <span>{title}</span>
      {progress >= 0 && (
        <div className="process">
          <div className="process-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

const ThreeViewer: FC<{ render: Function; opts?: Record<string, any> }> = ({
  opts,
  render,
}) => {
  const { ref, info } = useMountThreeRef(render, opts);

  return (
    <div ref={ref} className="three-viewer">
      {info.type === 'loading' && (
        <Loading title={info.title} progress={info.progress} />
      )}
    </div>
  );
};

export default ThreeViewer;
