import { useMethod, useProperty$ } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';

function useSelected() {
  const getSelected = useMethod(EditorStateService, 'getSelected');
  return useProperty$(EditorStateService, 'selected$', getSelected());
}

export default useSelected;
