import { useMethodCall } from 'editor/di';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import { BlueprintService } from 'editor/BlueprintService';

/**
 * @param id rendered object id
 */
function useBlueprint(id: string) {
  const renderedObject = useMethodCall(RenderedObjectService, 'get', [id]);
  if (!renderedObject) throw new Error();
  return useMethodCall(BlueprintService, 'get', [renderedObject.blueprintId]);
}

export default useBlueprint;
