export enum DragType {
  Up = 'dnd-resizer-up',
  Down = 'dnd-resizer-down',
  Left = 'dnd-resizer-left',
  Right = 'dnd-resizer-right',
  UpLeft = 'dnd-resizer-upLeft',
  DownRight = 'dnd-resizer-downRight',
  UpRight = 'dnd-resizer-upRight',
  DownLeft = 'dnd-resizer-downLeft',
}

export interface DraggingObject {
  type: DragType;
  uuid: string;
  id: unknown;
  group?: string;
}
