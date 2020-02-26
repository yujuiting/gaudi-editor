import { useMethod } from 'editor/di';
import { ViewService } from 'editor/ViewService';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Rect } from 'base/math';

function useViewRect(scope: string) {
  const watchRect = useMethod(ViewService, 'watchRect');
  const value$ = useMemo(() => watchRect(scope), [watchRect, scope]);
  const [view, setView] = useState<Rect>(Rect.zero);
  useEffect(() => {
    const subscription = value$.subscribe(setView);
    return () => subscription.unsubscribe();
  }, [value$, setView]);
  const updateRect = useMethod(ViewService, 'updateRect');
  return [view, useCallback((rect: Rect) => updateRect(scope, rect), [updateRect, scope])] as const;
}

export default useViewRect;
