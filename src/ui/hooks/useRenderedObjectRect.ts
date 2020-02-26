import { switchMap, startWith } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Rect } from 'base/math';
import { useMethod } from 'editor/di';
import { RenderedObjectService } from 'editor/RenderedObjectService';

function useRenderedObjectRect(id: string) {
  const getRect = useMethod(RenderedObjectService, 'getRect');
  const watchRect = useMethod(RenderedObjectService, 'watchRect');
  return useObservable<Rect, [string]>(
    inputs$ => inputs$.pipe(switchMap(([id]) => watchRect(id).pipe(startWith(getRect(id))))),
    Rect.zero,
    [id]
  );
}

export default useRenderedObjectRect;
