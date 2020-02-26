import { useMethod, useProperty$ } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';

function useHovered() {
  const getHovered = useMethod(EditorStateService, 'getHovered');
  return useProperty$(EditorStateService, 'hovered$', getHovered());
}

export default useHovered;
