export interface IPos {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IDragItem extends IPos, ISize {
  id: string;
}

export interface ILine {
  x: number;
  y: number;
  width?: number;
  height?: number;
}
