## 上一个版本存在许多bug,此次重构了代码，重写了实现逻辑和计算算法，使用方法也更简单了
# react-rnd-dragline
这是一个基于 react-rnd 实现的拖拽组件，在rnd的功能基础上增加了拖拽时显示辅助线及吸附的功能。

# 安装
$ npm i react-rnd-dragline

or

$ yarn add react-rnd-dragline

# 使用

## 属性

+ DragArea
  + bounds: RndProps['bounds']  
  
     默认值为空 ''

     拖拽边界，应用到所有DragItem上，也可以单独在DragItem上使用
  + guidelineColor: string
  
    辅助线颜色，默认值：'#448ef7'
  + guidelineWidth: number
  
     辅助线宽度,默认值：1
  + onAdsorb: boolean

    是否开启吸附效果，默认值：ture
  + adsorbThreshold: number

    吸附阈值，onAdsorb为ture时生效，默认值为：3

+ DragItem
  继承 `react-rnd`的所有属性，更多属性请参考 [react-rnd](https://www.npmjs.com/package/react-rnd)



## 使用方法示例
```tsx
import { DragArea, DragItem } from '@/components/RndDragline';
import './index.less';

export default function IndexPage() {
  return (
    <>
      <DragArea
        bounds="body"
        guidelineColor="red"
        onAdsorb={true}
        adsorbThreshold={5}
      >
        <DragItem>
          <div className="t t1">a</div>
        </DragItem>
        <DragItem>
          <div className="t t1">b</div>
        </DragItem>
        <DragItem>
          <div className="t t2">c</div>
        </DragItem>
        <DragItem>
          <div className="t t3">d</div>
        </DragItem>
      </DragArea>
    </>
  );
}


```
