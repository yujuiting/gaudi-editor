import { useCallback } from 'react';
import { JSONValue } from 'gaudi';
import { ScaffoldId } from 'base/id';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';
import { useObserver } from './useUpdater';
import { startWith } from 'rxjs/operators';

function useProp<T extends JSONValue>(id: ScaffoldId, key: string) {
  const get = useMethod(OperatorService, 'getProp');
  const watch = useMethod(OperatorService, 'watchProp');
  const update = useMethod(OperatorService, 'updateProp');
  const updateValue = useCallback((value: T) => update(id, key, value), [update, id, key]);
  const value =
    useObserver(() => watch(id, key).pipe(startWith(get(id, key))), [id, key]) || get(id, key);
  return [value, updateValue] as const;
}

export default useProp;
