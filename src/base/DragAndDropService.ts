import { Service } from 'typedi';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Initializable, Destroyable, InitializerService } from 'base/LifeCycle';
import { Vector } from 'base/math';
import { MouseService } from 'base/MouseService';
import * as dom from 'base/dom';
import { Subscription, Subject } from 'rxjs';

function filterSourceElement<T extends DragEvent | HoverEvent | DropEvent>(
  element?: HTMLElement | null
) {
  return filter<T>(e => e.source.element === element);
}

function filterDestinationElement<T extends HoverEvent | DropEvent>(element?: HTMLElement | null) {
  return filter<T>(e => e.destination.element === element);
}

export interface DragEvent {
  source: Draggable;
  initial: Vector;
  diff: Vector;
  delta: Vector;
  current: Vector;
  offset: Vector;
}

export interface HoverEvent {
  readonly source: Draggable;
  readonly destination: Droppable;
  readonly hovered: boolean;
}

export interface DropEvent {
  readonly source: Draggable;
  readonly destination: Droppable;
}

export interface DraggableConfig {
  readonly type?: string;
  readonly data?: Readonly<unknown>;
}

export interface Draggable extends DraggableConfig {
  readonly element: HTMLElement;
}

export interface DroppableConfig {
  readonly accepts: string[];
  readonly canDrop?: (source: Draggable) => boolean;
}

export interface Droppable extends DroppableConfig {
  readonly element: HTMLElement;
}

interface Dragging {
  source: Draggable;
  initial: Vector;
  // diff from initial
  diff: Vector;
  current: Vector;
  offset: Vector;
  // location of last time
  last: Vector;
  // delta from last time
  delta: Vector;
}

@Service()
export class DragAndDropService implements Initializable, Destroyable {
  private beginDrag = new Subject<DragEvent>();

  private stopDrag = new Subject<DragEvent>();

  private drag = new Subject<DragEvent>();

  private hover = new Subject<HoverEvent>();

  private drop = new Subject<DropEvent>();

  private draggables = new Map<HTMLElement, Draggable>();

  private droppables = new Map<HTMLElement, Droppable>();

  private dragging: Dragging | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private mouse: MouseService, initializer: InitializerService) {
    initializer.register(this);
  }

  initialize() {
    this.subscriptions.push(
      this.mouse.down$
        .pipe(
          filter(e => this.draggables.has(e.target as HTMLElement)),
          tap(e => this.handleBeginDrag(e)),
          switchMap(() =>
            this.mouse.move$.pipe(
              tap(e => this.updateDragging(e)),
              takeUntil(this.mouse.up$.pipe(tap(() => this.stopDragging())))
            )
          )
        )
        .subscribe()
    );
  }

  destroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }

    this.subscriptions = [];
  }

  registerDraggable(element: HTMLElement, config: DraggableConfig = {}) {
    this.draggables.set(element, { element, ...config });
    return () => this.unregisterDraggable(element);
  }

  unregisterDraggable(element: HTMLElement) {
    this.draggables.delete(element);
  }

  registerDroppable(element: HTMLElement, config: DroppableConfig) {
    this.droppables.set(element, { element, ...config });
    return () => this.unregisterDroppable(element);
  }

  unregisterDroppable(element: HTMLElement) {
    this.droppables.delete(element);
  }

  observeBeginDrag(element?: HTMLElement | null) {
    return this.beginDrag.pipe(filterSourceElement(element));
  }

  observeStopDrag(element?: HTMLElement | null) {
    return this.stopDrag.pipe(filterSourceElement(element));
  }

  observeDrag(element?: HTMLElement | null) {
    return this.drag.pipe(filterSourceElement(element));
  }

  observeHover(element?: HTMLElement | null) {
    return this.hover.pipe(filterDestinationElement(element));
  }

  observeDrop(element?: HTMLElement | null) {
    return this.drop.pipe(filterDestinationElement(element));
  }

  private handleBeginDrag(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const source = this.draggables.get(target)!;
    const initial = dom.getPagePointFromMouseEvent(e);
    const offset = dom.getRect(target).position.sub(initial);
    this.dragging = {
      source,
      initial,
      current: initial,
      diff: Vector.zero,
      offset,
      delta: Vector.zero,
      last: initial,
    };
    this.beginDrag.next(this.dragging);
  }

  private updateDragging(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.dragging) return;
    const { source, initial, offset } = this.dragging;
    const current = dom.getPagePointFromMouseEvent(e);
    const diff = current.sub(this.dragging.initial);
    const delta = current.sub(this.dragging.last);
    this.onHover(source, current);
    this.dragging.current = current;
    this.dragging.diff = diff;
    this.dragging.delta = delta;
    this.dragging.last = current;
    this.drag.next({ source, initial, current, diff, offset, delta });
  }

  private stopDragging() {
    if (!this.dragging) return;
    const { source, current } = this.dragging;
    this.clearHover(source);
    this.onDrop(source, current);
    this.stopDrag.next(this.dragging);
  }

  private onHover(source: Draggable, location: Vector) {
    for (const [destElement, destination] of this.droppables) {
      const destRect = dom.getRect(destElement);
      const hovered = destRect.contains(location);
      this.hover.next({ destination, source, hovered });
    }
  }

  private onDrop(source: Draggable, location: Vector) {
    if (!source.type) return null;

    for (const [destElement, destination] of this.droppables) {
      if (!destination.accepts.includes(source.type)) continue;
      const destRect = dom.getRect(destElement);
      if (destination.canDrop && !destination.canDrop(source)) continue;
      if (destRect.contains(location)) this.drop.next({ destination, source });
    }
  }

  private clearHover(source: Draggable) {
    for (const [, destination] of this.droppables) {
      this.hover.next({ destination, source, hovered: false });
    }
  }
}
