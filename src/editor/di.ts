import 'reflect-metadata';
import { useMemo } from 'react';
import { Container, ObjectType } from 'typedi';
import { Observable } from 'rxjs';
import { useObservable } from 'rxjs-hooks';
import { Gaudi } from 'gaudi';
import { useMethod as useInstanceMethod, ExtractTypeOf, ExcludeTypeOf } from 'base/hooks';

import { KeybindingService } from 'base/KeybindingService';
import { HistoryService } from 'base/HistoryService';
import { ProjectService } from 'editor/ProjectService';
import { BlueprintService } from 'editor/BlueprintService';
import { OperatorService } from 'editor/OperatorService';
import { RendererService } from 'editor/RendererService';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import { WidgetRegistryService } from 'editor/widget/WidgetRegistryService';
import { WidgetService } from 'editor/widget/WidgetService';
import { EditorPlugin } from 'editor/EditorPlugin';
import { ViewService } from 'editor/ViewService';

Container.set({ id: Gaudi, type: Gaudi });

// initialize services
Container.get(KeybindingService);
Container.get(HistoryService);
Container.get(ProjectService);
Container.get(BlueprintService);
Container.get(OperatorService);
Container.get(RendererService);
Container.get(RenderedObjectService);
Container.get(WidgetRegistryService);
Container.get(WidgetService);
Container.get(EditorPlugin);
Container.get(ViewService);

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

export function useMethod<T, K extends ExtractTypeOf<T, Function>>(
  type: ObjectType<T>,
  methodName: K
) {
  const service = Container.get(type);
  return useInstanceMethod<T, K>(service, methodName);
}

export function useMethodCall<
  T,
  K extends ExtractTypeOf<T, Function>,
  P extends Parameters<T[K]>,
  R extends ReturnType<T[K]>
>(type: ObjectType<T>, methodName: K, args: P): R {
  const service = Container.get(type);
  const method: Function = useInstanceMethod<T, K>(service, methodName);
  return useMemo(() => method(...args), [method, ...args]); // eslint-disable-line
}
