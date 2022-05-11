import React, { Fragment, PureComponent, createRef, ReactElement, ReactNode } from 'react';
import { DraggableEventHandler } from 'react-draggable';
import { Rnd, RndResizeCallback, Props as RndProps } from 'react-rnd';
import { nanoid } from 'nanoid';
import { IPos, ISize, IDragItem } from './types';
import { getMidCoordinate } from './utils';

interface IWithRndProps extends RndProps {
  init?: (dragItem: IDragItem) => void;
  dragging?: (dragItem: IDragItem) => void;
  dragged?: (dragItem?: IDragItem) => void;
  getCoordinateMap?: (dragItem: IDragItem) => Map<string, IDragItem[]>;
  onAdsorb?: boolean;
  adsorbThreshold?: number;
  children: ReactElement;
}

interface IWithRndState extends ISize, IPos {
  mounted: boolean;
  dragging: boolean;
}

type TAdsorbResult = { x: number | null; y: number | null };

export class DragItem extends PureComponent<IWithRndProps, IWithRndState> {
  state = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mounted: false,
    dragging: false,
  };
  ref = createRef<HTMLElement>();
  id = nanoid();

  componentDidMount() {
    const { left, top, width, height } =
      this.ref.current?.getBoundingClientRect()!;
    const x =
      parseFloat(getComputedStyle(this.ref.current as HTMLElement).marginLeft) +
      left;
    const y =
      parseFloat(getComputedStyle(this.ref.current as HTMLElement).marginTop) +
      top;

    this.props.init!({ id: this.id, x, y, width, height });
    this.setState(
      {
        x,
        y,
        width,
        height,
        mounted: true,
      },
      () => {
        this.ref.current!.style.marginTop = '0';
        this.ref.current!.style.marginLeft = '0';
      },
    );
  }

  isAdsorb(dragItem: IDragItem): TAdsorbResult {
    const threshold = this.props.adsorbThreshold || 3;
    const result: TAdsorbResult = { x: null, y: null };
    const coordinateMap = this.props.getCoordinateMap!(dragItem);
    const xList: number[] = [];
    const xCenterList: number[] = [];
    const yList: number[] = [];
    const yCenterList: number[] = [];

    for (let [k, items] of coordinateMap) {
      const excludeSelfItems = items.filter((item) => item.id !== dragItem.id);
      const number = +k.split('|')[0];

      if (/\|x\b/.test(k)) {
        excludeSelfItems.map(() => xList.push(number));
      } else if (k.includes('xCenter')) {
        excludeSelfItems.map(() => xCenterList.push(number));
      } else if (/\|y\b/.test(k)) {
        excludeSelfItems.map(() => yList.push(number));
      } else if (k.includes('yCenter')) {
        excludeSelfItems.map(() => yCenterList.push(number));
      }
    }

    xList.sort((a, b) => a - b);
    xCenterList.sort((a, b) => a - b);
    yList.sort((a, b) => a - b);
    yCenterList.sort((a, b) => a - b);

    for (let i = 0; i < xList.length; i++) {
      const needCompareX = xList[i];
      if (
        dragItem.x >= needCompareX &&
        dragItem.x <= needCompareX + threshold
      ) {
        result.x = needCompareX;
        break;
      } else if (
        dragItem.x + dragItem.width >= needCompareX - threshold &&
        dragItem.x + dragItem.width <= needCompareX
      ) {
        result.x = needCompareX - dragItem.width;
        break;
      }
    }

    if (result.x === null) {
      for (let i = 0; i < xCenterList.length; i++) {
        const needCompareX = xCenterList[i];
        const midX = getMidCoordinate(dragItem.x, dragItem.x + dragItem.width);
        if (
          midX >= needCompareX - threshold &&
          midX <= needCompareX + threshold
        ) {
          result.x = needCompareX - dragItem.width / 2;
          break;
        }
      }
    }

    for (let i = 0; i < yList.length; i++) {
      const needCompareY = yList[i];
      if (
        dragItem.y >= needCompareY &&
        dragItem.y <= needCompareY + threshold
      ) {
        result.y = needCompareY;
        break;
      } else if (
        dragItem.y + dragItem.width >= needCompareY - threshold &&
        dragItem.y + dragItem.width <= needCompareY
      ) {
        result.y = needCompareY - dragItem.height;
        break;
      }
    }

    if (result.y === null) {
      for (let i = 0; i < yCenterList.length; i++) {
        const needCompareY = yCenterList[i];
        const midY = getMidCoordinate(dragItem.y, dragItem.y + dragItem.height);
        if (
          midY >= needCompareY - threshold &&
          midY <= needCompareY + threshold
        ) {
          result.y = needCompareY - dragItem.height / 2;
          break;
        }
      }
    }

    return result;
  }

  onDrag: DraggableEventHandler = (e, data) => {
    const { dragging, onDrag } = this.props;
    const { width, height } = this.state;
    const dragItem: IDragItem = {
      id: this.id,
      x: data.x,
      y: data.y,
      width,
      height,
    };
    const adsorb = this.isAdsorb(dragItem);

    dragging!(dragItem);
    onDrag && onDrag(e, data);

    if (this.props.onAdsorb) {
      this.setState({
        x: adsorb.x || data.x,
        y: adsorb.y || data.y,
        dragging: true,
      });
    } else {
      this.setState({
        x: data.x,
        y: data.y,
        dragging: true,
      });
    }
  };

  onDragStop: DraggableEventHandler = (e, data) => {
    const { dragged, onDragStop } = this.props;
    dragged!();
    this.setState({ dragging: false });
    onDragStop && onDragStop(e, data);
  };

  onResizeStop: RndResizeCallback = (e, dir, refToElement, delta, position) => {
    const { onResizeStop } = this.props;

    this.setState(
      (prev) => {
        return {
          x: position.x,
          y: position.y,
          width: delta.width + prev.width,
          height: delta.height + prev.height,
        };
      },
      () => {
        onResizeStop && onResizeStop(e, dir, refToElement, delta, position);
      },
    );
  };

  render(): ReactNode {
    const { x, y, width, height, mounted, dragging } = this.state;
    const { children } = this.props;
    const rndProps = {
      ...this.props,
      onDrag: this.onDrag,
      onDragStop: this.onDragStop,
      onResizeStop: this.onResizeStop,
    };
    const excludeProps = [
      'init',
      'dragging',
      'dragged',
      'getCoordinateMap',
      'onAdsorb',
      'adsorbThreshold',
    ];
    excludeProps.forEach((key) => Reflect.deleteProperty(rndProps, key));

    return (
      <Fragment>
        {mounted ? (
          <Rnd
            size={{ width, height }}
            position={{ x, y }}
            {...rndProps}
            style={{
              zIndex: dragging
                ? 99999
                : getComputedStyle(this.ref.current!).zIndex,
            }}
          >
            <children.type
              {...children.props}
              ref={this.ref}
              style={{ width: '100%', height: '100%' }}
            />
          </Rnd>
        ) : (
          <children.type {...children.props} ref={this.ref} />
        )}
      </Fragment>
    );
  }
}
