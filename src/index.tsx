import React, {
  CSSProperties,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { DraggableEventHandler } from 'react-draggable';
import { Rnd, Props as RndProps } from 'react-rnd';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import {
  ILine,
  ICompareNode,
  basicLine,
  detection,
  getLineInfo,
  getPosRelativeParent,
} from './utils'

export type TUpateHandle = (id: string, ref: HTMLElement, x: number, y: number) => any;

interface IItemProps extends RndProps {
  id:string;
  position: { x: number; y: number };
  dragUpdate: TUpateHandle;
  resizeUpdate?: TUpateHandle;
  displayGuide?: boolean;
  lineColor?: string;
}

const commonClassName = '_drag_line_' + nanoid();


export function DragLineItem(props: IItemProps) {
  const {
    id,
    position,
    dragUpdate,
    resizeUpdate,
    lineColor = '#fd0303',
    displayGuide = true,
    children,
  } = props;
  const [line, setLine] = useState<ILine>(basicLine);
  const className = useRef('drag-line_item' + nanoid());
  const baseLineStyle: CSSProperties = useMemo(() => {
    return {
      position: 'absolute',
      backgroundColor: lineColor,
      zIndex: 100,
    };
  }, [lineColor]);

  const getShouldCompareNode = () => {
    let shouldCompareNode: Array<ICompareNode> = [];

    document
      .querySelectorAll<HTMLElement>(`.${commonClassName}`)
      .forEach((node) => {
        //排除当前操作的节点，不与自己比较
        if (!node.classList.contains(className.current)) {
          shouldCompareNode.push(getPosRelativeParent(node));
        }
      });

    return shouldCompareNode;
  };

  const handleMouseUp = () => {
    setLine(basicLine);
  };

  //@ts-ignore
  const rndDrag: DraggableEventHandler = (e, data) => {
    if (displayGuide) {
      const d = async function () {
        const shouldCompareNode = getShouldCompareNode();
        const curNode = getPosRelativeParent(data.node);
        const r = detection(curNode, shouldCompareNode, { x: data.x, y: data.y });

        if (r.isBlend) {
          await dragUpdate(id, data.node, r.x, r.y);
          const rect = getPosRelativeParent(data.node, document.body);
          const line = getLineInfo(getPosRelativeParent(data.node), shouldCompareNode);

          setLine((pre) => ({
            ...pre,
            ...line,
            lt: rect.y + line.lt,
            ll: rect.x,

            rt: rect.y + line.rt,
            rl: rect.x + rect.w,

            tt: rect.y,
            tl: rect.x + line.tl,

            bt: rect.y + rect.h,
            bl: rect.x + line.bl,

            cl: line.cl !== 0 ? rect.x + line.cl : 0,
            ct: line.ct !== 0 ? rect.y + line.ct : 0,
          }));
        } else {
          setLine(basicLine);
        }
      };
      d();
    }
  };

  //@ts-ignore
  const rndDragStop: DraggableEventHandler = (e, data) => {
    const p = { x: data.x, y: data.y };
    const curNode = getPosRelativeParent(data.node);
    const r = detection(curNode, getShouldCompareNode(), p);
    dragUpdate(id, data.node, r.x, r.y);
  };

  useEffect(() => {
    const cur = document.querySelector(`.${className.current}`);
    cur?.addEventListener('mouseup', handleMouseUp);

    return () => {
      cur?.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const rndProps = { ...props };
  const ownProps = ['displayGuide', 'lineColor', 'dragUpdate', 'resizeUpdate'];
  ownProps.forEach(key => {
    Reflect.deleteProperty(rndProps, key);
  });

  return (
    <>
      <Rnd
        {...rndProps}
        position={position}
        onDrag={rndDrag}
        onDragStop={rndDragStop}
        // @ts-ignore
        onResizeStop={(e, dir, ref, delta, position) => {
          resizeUpdate && resizeUpdate(id, ref, position.x, position.y)
        }}
        className={classNames(
          props.className,
          className.current,
          commonClassName,
        )}
      >
        {children}
      </Rnd>
      {createPortal(
        <>
          {
            line.lh ? <div
              className={'ll'}
              style={{
                ...baseLineStyle,
                left: line.ll + 'px',
                top: line.lt + 'px',
                height: line.lh + 'px',
                width: line.lw + 'px',
              }}
            /> : null
          }
          {
            line.cxh ? <div
              className={'cl'}
              style={{
                ...baseLineStyle,
                left: line.cl + 'px',
                top: line.lt + 'px',
                height: line.cxh + 'px',
                width: line.cxw + 'px',
              }}
            /> : null
          }
          {
            line.rh ? <div
              className={'rl'}
              style={{
                ...baseLineStyle,
                left: line.rl + 'px',
                top: line.rt + 'px',
                height: line.rh + 'px',
                width: line.rw + 'px',
              }}
            /> : null
          }
          {
            line.tw ? <div
              className={'tt'}
              style={{
                ...baseLineStyle,
                top: line.tt + 'px',
                left: line.tl + 'px',
                height: line.th + 'px',
                width: line.tw + 'px',
              }}
            /> : null
          }
          {
            line.cyw ? <div
              className={'ct'}
              style={{
                ...baseLineStyle,
                top: line.ct + 'px',
                left: line.tl + 'px',
                height: line.cyh + 'px',
                width: line.cyw + 'px',
              }}
            /> : null
          }
          {
            line.bw ? <div
              className={'bt'}
              style={{
                ...baseLineStyle,
                top: line.bt + 'px',
                left: line.bl + 'px',
                height: line.bh + 'px',
                width: line.bw + 'px',
              }}
            /> : null
          }
        </>,
        document.body,
      )}
    </>
  );
}