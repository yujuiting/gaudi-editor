import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { Rect } from 'base/math';
import { ElementId } from 'base/id';
import { useMethod } from 'editor/di';
import { ElementService } from 'editor/ElementService';

export function useElementRects(ids: ElementId[]) {
  const getRect = useMethod(ElementService, 'getRect');
  const watchRect = useMethod(ElementService, 'watchRect');
  const [rects, setRects] = useState<Rect[]>([]);
  useEffect(() => {
    const result: Rect[] = [];
    const subscriptions: Subscription[] = [];
    ids.forEach((id, index) => {
      result.push(getRect(id));
      const subscription = watchRect(id).subscribe(rect =>
        setRects(prev => [...prev.slice(0, index), rect, ...prev.slice(index + 1)])
      );
      subscriptions.push(subscription);
    });
    setRects(result);
    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [ids, getRect, watchRect, setRects]);
  return rects;
}

export default useElementRects;
