import { useState, useEffect, useCallback } from 'react';
import { Rect } from 'base/math';
import { useMethod } from 'editor/di';
import { ViewService } from 'editor/ViewService';

function useViewRect(scope: string) {
  const watch = useMethod(ViewService, 'watchRect');
  const update = useMethod(ViewService, 'updateRect');
  const [view, setView] = useState<Rect>(Rect.zero);
  const updateValue = useCallback((rect: Rect) => update(scope, rect), [update, scope]);
  useEffect(() => {
    const subscription = watch(scope).subscribe(setView);
    return () => subscription.unsubscribe();
  }, [watch, scope, setView]);
  return [view, updateValue] as const;
}

export default useViewRect;
