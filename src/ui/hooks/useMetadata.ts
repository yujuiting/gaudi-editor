import { useMethodCall } from 'editor/di';
import { ComponentService } from 'editor/ComponentService';
import { ElementId } from 'base/id';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';

function useMetadata(id: ElementId) {
  const type = useMethodCall(ScaffoldService, 'getType', [id.scaffoldId]);
  return useMethodCall(ComponentService, 'getMetadata', [type]);
}

export default useMetadata;
