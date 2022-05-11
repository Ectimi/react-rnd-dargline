import React, {
  Fragment,
  Children,
  ReactElement,
  ReactNode,
  PureComponent,
} from 'react';
import { Props as RndProps } from 'react-rnd';
import { getMidCoordinate } from './utils';
import { IDragItem, ILine } from './types';

interface IDragAreaProps {
  children: ReactElement | ReactElement[];
  bounds?: RndProps['bounds'];
  enableResizing?: RndProps['enableResizing'];
  guidelineColor?: string;
  guidelineWidth?: number;
  onAdsorb?: boolean;
  adsorbThreshold?: number;
}

interface IDrageAreaState {
  guidelines: ILine[];
}

export class DragArea extends PureComponent<IDragAreaProps, IDrageAreaState> {
  items: IDragItem[] = [];
  coordinateMap: Map<string, IDragItem[]> = new Map();
  currentDragItem: IDragItem | undefined;
  state: IDrageAreaState = {
    guidelines: [],
  };

  componentDidMount() {
    this.updateCoordinateMap();
  }

  init = (dragItem: IDragItem) => {
    this.items.push(dragItem);
  };

  updateCoordinateMap = (dragItem?: IDragItem): Map<string, IDragItem[]> => {
    if (dragItem) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].id === dragItem.id) {
          this.items[i] = dragItem;
          break;
        }
      }
    }

    this.coordinateMap.clear();

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      let x1 = item.x;
      let x2 = x1 + item.width;
      let x3 = getMidCoordinate(x2, x1);
      let y1 = item.y;
      let y2 = y1 + item.height;
      let y3 = getMidCoordinate(y2, y1);
      let keys = [
        x1 + '|x',
        x2 + '|x',
        x3 + '|xCenter',
        y1 + '|y',
        y2 + '|y',
        y3 + '|yCenter',
      ];
      keys.forEach((key) => {
        if (this.coordinateMap.get(key)) {
          this.coordinateMap.set(key, [...this.coordinateMap.get(key)!, item]);
        } else {
          this.coordinateMap.set(key, [item]);
        }
      });
    }

    return this.coordinateMap;
  };

  getGuideLine = (dragItem: IDragItem) => {
    const { guidelineWidth = 1 } = this.props;

    this.updateCoordinateMap(dragItem);
    let x1 = dragItem.x;
    let x2 = dragItem.x + dragItem.width;
    let x3 = getMidCoordinate(x2, x1);
    let y1 = dragItem.y;
    let y2 = dragItem.y + dragItem.height;
    let y3 = getMidCoordinate(y2, y1);
    let keys = [
      x1 + '|x',
      x2 + '|x',
      x3 + '|xCenter',
      y1 + '|y',
      y2 + '|y',
      y3 + '|yCenter',
    ];
    let guidelines: ILine[] = [];

    keys.forEach((key) => {
      for (let [k, items] of this.coordinateMap) {
        if (items.length > 1) {
          if (key === k) {
            let line: ILine;
            if (key.includes('x')) {
              const sorted = [...items].sort((a, b) => a.y - b.y);
              let minY = sorted[0].y;
              let maxY = sorted[sorted.length - 1].y;
              line = {
                x: +key.split('|')[0],
                y: minY,
                width: guidelineWidth,
                height: maxY + sorted[sorted.length - 1].height - minY,
              };
            } else if (key.includes('y')) {
              const sorted = [...items].sort((a, b) => a.x - b.x);
              let minX = sorted[0].x;
              let maxX = sorted[sorted.length - 1].x;
              line = {
                x: minX,
                y: +key.split('|')[0],
                width: maxX + sorted[sorted.length - 1].width - minX,
                height: guidelineWidth,
              };
            }
            guidelines.push(line!);
          }
        }
      }
    });

    this.setState({ guidelines });
  };

  onDragStop = () => {
    this.setState({ guidelines: [] });
  };

  render(): ReactNode {
    const {
      bounds = '',
      enableResizing = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      },
      guidelineColor = '#448ef7',
      onAdsorb = true,
      adsorbThreshold = 3,
    } = this.props;
    return (
      <Fragment>
        {Children.map<ReactNode, ReactElement>(
          this.props.children,
          (element) => {
            return (
              <element.type
                init={this.init}
                dragging={this.getGuideLine}
                dragged={this.onDragStop}
                getCoordinateMap={this.updateCoordinateMap}
                bounds={bounds}
                enableResizing={enableResizing}
                onAdsorb={onAdsorb}
                adsorbThreshold={adsorbThreshold}
                {...element.props}
              />
            );
          },
        )}
        {this.state.guidelines.map((line, index) => (
          <div
            key={index}
            style={{
              position: 'fixed',
              left: line.x,
              top: line.y,
              width: line.width,
              height: line.height,
              backgroundColor: guidelineColor,
            }}
          ></div>
        ))}
      </Fragment>
    );
  }
}
