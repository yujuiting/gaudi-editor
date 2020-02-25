import { useMethod } from 'editor/di';
import { ViewService } from 'editor/ViewService';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Size, Rect } from 'base/math';

function useViewRect(scope: string) {
  const watchRect = useMethod(ViewService, 'watchRect');
  const value$ = useMemo(() => watchRect(scope), [watchRect, scope]);
  const [view, setView] = useState<Rect>(Rect.zero);
  useEffect(() => {
    const subscription = value$.subscribe(setView);
    return () => subscription.unsubscribe();
  }, [value$, setView]);
  const updateViewSize = useMethod(ViewService, 'updateViewSize');
  return [
    view,
    useCallback((size: Size) => updateViewSize(scope, size), [updateViewSize, scope]),
  ] as const;
}

export default useViewRect;
