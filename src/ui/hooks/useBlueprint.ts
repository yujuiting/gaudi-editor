import { useMethodCall } from 'editor/di';
import { ElementService } from 'editor/ElementService';
import { BlueprintService } from 'editor/BlueprintService';

/**
 * @param id rendered object id
 */
function useBlueprint(id: string) {
  const element = useMethodCall(ElementService, 'get', [id]);
  if (!element) throw new Error();
  return useMethodCall(BlueprintService, 'get', [element.blueprintId]);
}

export default useBlueprint;
