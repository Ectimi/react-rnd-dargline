# react-rnd-dragline
这是一个基于 react-rnd 实现的拖拽组件，在rnd的功能基础上增加了拖拽时显示辅助线及吸附的功能。

# 安装
$ npm i react-rnd-dragline

or

$ yarn add react-rnd-dragline

# 使用

## 属性
```ts
//继承 react-rnd 的所有属性

type TUpateHandle = (id: string, ref: HTMLElement, x: number, y: number) => any;

interface IItemProps extends RndProps {
  //必须
  //元素唯一标识
  id:string;

  //必须
  //元素位置 
  position: { x: number; y: number };

  //必须
  //拖拽更新函数，用来拖拽及拖拽结束时更新元素位置，大小。  
  dragUpdate: TUpateHandle;

  //可选 但 enableResizing 属性为 true 时 ，必须提供，否则缩放不会生效
  //缩放更新函数，用来缩放时更新元素的位置，大小，
  resizeUpdate?: TUpateHandle;

  //可选
  //是否显示辅助线
  displayGuide?: boolean;

  //可选
  //辅助线颜色
  lineColor?: string;
}
```

更多属性请参考 [react-rnd](https://www.npmjs.com/package/react-rnd)

## 使用方法示例
```js
import './App.css';
import React, { useState, useMemo } from 'react';
import { DragLineItem, TUpateHandle } from 'react-rnd-dragline'
import { nanoid } from 'nanoid';

function App() {
  const [nodes, setNodes] = useState([
    {
      id: nanoid(),
      position: { x: 0, y: 0 },
      size: { width: 300, height: 100 },
      bgColor: 'red',
      name:'元素A'
    },
    {
      id: nanoid(),
      position: { x: 0, y: 40 },
      size: { width: 250, height: 40 },
      bgColor: 'yellow',
      name:'元素B'
    },
    {
      id: nanoid(),
      position: { x: 30, y: 280 },
      size: { width: 100, height: 80 },
      bgColor: 'green',
      name:'元素C'
    },
  ])

  const dragUpdate: TUpateHandle = (id, ref, x, y) => {
    setNodes(pre => ([
      ...pre.filter(node => node.id !== id),
      { ...pre.filter(node => node.id === id)[0], position: { x, y } }
    ]))
  }

  const resizeUpdate: TUpateHandle = (id, ref, x, y) => {
    setNodes(pre => ([
      ...pre.filter(node => node.id !== id),
      {
        ...pre.filter(node => node.id === id)[0],
        position: { x, y },
        size: {
          width: ref.getBoundingClientRect().width,
          height: ref.getBoundingClientRect().height
        }
      }
    ]))
  }

  const content = useMemo(() => {
    return (
      <>
        {nodes.map((node) => (
          <DragLineItem
            key={node.id}
            id={node.id}
            position={node.position}
            size={node.size}
            dragUpdate={dragUpdate}
            resizeUpdate={resizeUpdate}
            bounds={'parent'}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                opacity: .5,
                backgroundColor: node.bgColor
              }}
            >
              元素{node.name}
            </div>
          </DragLineItem>
        ))}
      </>
    )
  }, [nodes])

  return (
    <div className="App">
      <div
        style={{
          width:'100%',
          height:'100%',
          margin:'0 auto',
          backgroundColor:'gray'
        }}
      >
        {content}
      </div>
    </div>
  );
}

export default App;

```
