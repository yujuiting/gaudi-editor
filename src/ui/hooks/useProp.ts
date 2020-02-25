import { useCallback } from 'react';
import { useObservable } from 'rxjs-hooks';
import { JSONValue } from 'gaudi';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';

function useProp<T extends JSONValue>(id: string, key: string) {
  const get$ = useMethod(OperatorService, 'getBlueprintProp$');
  const update = useMethod(OperatorService, 'updateBlueprintProp');
  let value = useObservable(() => get$<T>(id, key), undefined, [id, key]);
  const setValue = useCallback((value: T) => update(id, key, value), [update, id, key]);
  if (value === null) value = undefined;
  return [value, setValue] as const;
}

export default useProp;
