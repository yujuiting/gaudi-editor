import { useProperty$, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';

function useHovered() {
  const hovered = useMethodCall(EditorStateService, 'getHovered', []);
  return useProperty$(EditorStateService, 'hovered$', hovered);
}

export default useHovered;
