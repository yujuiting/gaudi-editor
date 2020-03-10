import { useCallback } from 'react';
import { ScaffoldId } from 'base/id';
import { Draggable } from 'base/DragAndDropService';
import { useMethod } from 'editor/di';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';
import { isBlueprintDragData, isScaffoldDragData } from 'ui/hooks/dnd/types';

function useCanDrop(id: ScaffoldId) {
  const getType = useMethod(ScaffoldService, 'getType');
  const canInsertChild = useMethod(ScaffoldService, 'canInsertChild');
  const canDrop = useCallback(
    (source: Draggable) => {
      let blueprintType: string;
      if (isBlueprintDragData(source.data)) {
        blueprintType = source.data.blueprint.type;
      } else if (isScaffoldDragData(source.data)) {
        blueprintType = getType(source.data.id);
      } else {
        return false;
      }
      return canInsertChild(id, blueprintType);
    },
    [canInsertChild, getType, id]
  );
  return canDrop;
}

export default useCanDrop;
