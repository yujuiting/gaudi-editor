import { ScaffoldId, ElementId } from 'base/id';
import { useMemo } from 'react';

function useElementId(scopeName: string, scaffoldId: ScaffoldId) {
  return useMemo(() => ElementId.create(scopeName, scaffoldId), [scopeName, scaffoldId]);
}

export default useElementId;
