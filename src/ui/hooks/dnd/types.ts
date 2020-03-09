import { Blueprint } from 'gaudi';
import { ScaffoldId } from 'base/id';

export enum DnDType {
  Blueprint = 'blueprint',
  Scaffold = 'scaffold',
}

export class BlueprintDragData {
  static of(blueprint: Blueprint) {
    return new BlueprintDragData(blueprint);
  }

  constructor(public readonly blueprint: Blueprint) {}
}

export function isBlueprintDragData(value: unknown): value is BlueprintDragData {
  return value instanceof BlueprintDragData;
}

export class ScaffoldDragData {
  static of(id: ScaffoldId) {
    return new ScaffoldDragData(id);
  }

  constructor(public readonly id: ScaffoldId) {}
}

export function isScaffoldDragData(value: unknown): value is ScaffoldDragData {
  return value instanceof ScaffoldDragData;
}
