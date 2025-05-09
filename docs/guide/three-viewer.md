---
nav:
  title: 指南
  order: 0
title: ThreeViewer
---

本项目所有示例中均使用 `ThreeViewer` 组件进行渲染，源码如下：

```tsx | pure
import React, { type FC } from 'react';
import './index.less';

const inDemoPage = () => window.location.pathname.indexOf('~demos') > 0;

const useMountThreeRef = (render: Function, opts?: Record<string, any>) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [info, setInfo] = React.useState<Record<string, any> | null>(null);

  React.useEffect(() => {
    if (!render) return;
    const container = containerRef.current;

    let engine: any = null;
    const run = async () => {
      // 防止热更新被插入多次
      if (!container || container.children.length > 0) return;
      engine = render(
        {
          ...opts,
          ...(inDemoPage() ? { height: window.innerHeight } : {}),
          width: container.offsetWidth,
          container,
        },
        setInfo,
      );

      if (!engine.mount) {
        container.appendChild(engine.domElement);
      } else {
        engine.mount(container);
      }
    };

    run();

    return () => {
      if (!!engine && !!engine.unmount) engine.unmount();
    };
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
      {info?.type === 'loading' && (
        <Loading title={info.title} progress={info.progress} />
      )}
      {info?.type === 'start' && (
        <button className="button" onClick={info.callback}>
          {info.title}
        </button>
      )}
    </div>
  );
};

export default ThreeViewer;
```

组件样式

```less
.three-viewer {
  position: relative;
  display: flex;
  justify-content: center;
  transform: translateX(0);
}

.loading {
  position: absolute;
  left: 50%;
  bottom: 120px;
  width: 320px;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  color: #ffeb3b;
  z-index: 99;
  text-align: center;

  .process {
    margin-top: 4px;
    width: 100%;
    height: 10px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.5);
    overflow: hidden;

    &-bar {
      height: 100%;
      background: linear-gradient(180deg, #fff59d, #f4511e);
      transition: 0.5s linear;
    }
  }
}

.button {
  position: absolute;
  left: 50%;
  bottom: 120px;
  width: 320px;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  border: 1px solid #1677ff;
  transition: 0.2s ease;

  &:hover {
    box-shadow: 0 0 4px 0 #1677ff;
  }
}
```
