import 'reflect-metadata';
import { Container, ObjectType } from 'typedi';
import { Observable } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { ExtractTypeOf, ExcludeTypeOf } from 'base/type';
import { useMethod as useInstanceMethod } from 'base/hooks';

import { DragAndDropService } from 'base/DragAndDropService';
import { KeybindingService } from 'base/KeybindingService';
import { HistoryService } from 'editor/HistoryService';
import { ProjectService } from 'editor/ProjectService';
import { BlueprintService } from 'editor/BlueprintService';
import { OperatorService } from 'editor/OperatorService';
import { RendererService } from 'editor/RendererService';
import { ElementService } from 'editor/ElementService';
import { WidgetService } from 'editor/widget/WidgetService';
import { PanelService } from 'editor/widget/PanelService';
import { EditorPlugin } from 'editor/EditorPlugin';
import { ViewService } from 'editor/ViewService';
import { EditorStateService } from 'editor/EditorStateService';
import { ComponentService } from 'editor/ComponentService';
import { useMemo } from 'react';

// Container.set({ id: Gaudi, type: Gaudi });

// initialize services
Container.get(KeybindingService);
Container.get(HistoryService);
Container.get(ProjectService);
Container.get(BlueprintService);
Container.get(OperatorService);
Container.get(RendererService);
Container.get(ElementService);
Container.get(WidgetService);
Container.get(PanelService);
Container.get(EditorPlugin);
Container.get(ViewService);
Container.get(EditorStateService);
Container.get(DragAndDropService);
Container.get(ComponentService);

export function useProperty<T, K extends ExcludeTypeOf<T, Function>>(
  type: ObjectType<T>,
  propertyName: K
): T[K] {
  const service = Container.get(type);
  return service[propertyName];
}

type ObservedType<T> = T extends Observable<infer U> ? U : never;

export function useProperty$<T, K extends ExtractTypeOf<T, Observable<unknown>>>(
  type: ObjectType<T>,
  propertyName: K
): ObservedType<T[K]> | null;
export function useProperty$<T, K extends ExtractTypeOf<T, Observable<unknown>>>(
  type: ObjectType<T>,
  propertyName: K,
  defaultValue: ObservedType<T[K]>
): ObservedType<T[K]>;
export function useProperty$<T, K extends ExtractTypeOf<T, Observable<unknown>>>(
  type: ObjectType<T>,
  propertyName: K,
  defaultValue?: ObservedType<T[K]>
) {
  const service = Container.get(type);
  return useObservable(() => service[propertyName], defaultValue);
}

export function useMethod<T, K extends ExtractTypeOf<T, Function>, P extends Parameters<T[K]>>(
  type: ObjectType<T>,
  methodName: K,
  args: P
): () => ReturnType<T[K]>;
export function useMethod<T, K extends ExtractTypeOf<T, Function>>(
  type: ObjectType<T>,
  methodName: K
): T[K];
export function useMethod<T, K extends ExtractTypeOf<T, Function>, P extends Parameters<T[K]>>(
  type: ObjectType<T>,
  methodName: K,
  args?: P
) {
  const service = Container.get(type);
  return useInstanceMethod<T, K, P>(service, methodName, args);
}

export function useMethodCall<
  T,
  K extends ExtractTypeOf<T, Function>,
  P extends Parameters<T[K]>,
  R extends ReturnType<T[K]>
>(type: ObjectType<T>, methodName: K, args: P): R {
  const service = Container.get(type);
  const method: Function = useInstanceMethod<T, K, P>(service, methodName);
  // return method(...args);
  return useMemo(() => method(...args), [method, ...args]); // eslint-disable-line react-hooks/exhaustive-deps
}
