import { useMethodCall } from 'editor/di';
import { ComponentService } from 'editor/ComponentService';

function useMetadata(type: string) {
  return useMethodCall(ComponentService, 'getMetadata', [type]);
}

export default useMetadata;
