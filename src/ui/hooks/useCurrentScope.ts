import { useProperty$, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';

function useCurrentScope() {
  const currentScope = useMethodCall(EditorStateService, 'getCurrentScope', []);
  return useProperty$(EditorStateService, 'currentScope$', currentScope);
}

export default useCurrentScope;
