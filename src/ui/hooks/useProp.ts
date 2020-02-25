import { useCallback, useState, useEffect, useMemo } from 'react';
import { JSONValue } from 'gaudi';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';

function useProp<T extends JSONValue>(id: string, key: string) {
  const watch = useMethod(OperatorService, 'watchBlueprintProp');
  const update = useMethod(OperatorService, 'updateBlueprintProp');
  const value$ = useMemo(() => watch<T>(id, key), [watch, id, key]);
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    const subscription = value$.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [value$, setValue]);
  return [value, useCallback((value: T) => update(id, key, value), [update, id, key])] as const;
}

export default useProp;
