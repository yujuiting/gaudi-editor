import { useCallback, useState, useEffect } from 'react';
import { JSONValue } from 'gaudi';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';

function useProp<T extends JSONValue>(id: string, key: string) {
  const watch = useMethod(OperatorService, 'watchBlueprintProp');
  const update = useMethod(OperatorService, 'updateBlueprintProp');
  const [value, setValue] = useState<T | undefined>(undefined);
  const updateValue = useCallback((value: T) => update(id, key, value), [update, id, key]);
  useEffect(() => {
    const subscription = watch<T>(id, key).subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [watch, id, key]);
  return [value, updateValue] as const;
}

export default useProp;
