import { useMethodCall } from 'editor/di';
import { ElementService } from 'editor/ElementService';
import { BlueprintService } from 'editor/BlueprintService';

function useBlueprint(elementId: string) {
  const element = useMethodCall(ElementService, 'get', [elementId]);
  if (!element) throw new Error();
  return useMethodCall(BlueprintService, 'get', [element.blueprintId]);
}

export default useBlueprint;
