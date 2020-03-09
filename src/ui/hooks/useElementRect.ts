import { ElementId } from 'base/id';
import { useMethod } from 'editor/di';
import { ElementService } from 'editor/ElementService';
import { useObserver } from './useUpdater';

function useElementRect(id: ElementId) {
  const getRect = useMethod(ElementService, 'getRect', [id]);
  const watchRect = useMethod(ElementService, 'watchRect');
  return useObserver(() => watchRect(id), [id]) || getRect();
}

export default useElementRect;
