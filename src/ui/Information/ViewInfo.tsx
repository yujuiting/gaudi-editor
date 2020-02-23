import React, { useMemo } from 'react';
import { useProperty$, useMethod } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { Group, GroupTitle } from 'ui/components/Information';
import { Label } from 'ui/components/Input';
import { RenderedObjectService } from 'editor/RenderedObjectService';

const ViewInfo: React.FC = () => {
  const selected = useProperty$(EditorStateService, 'selected$', []);

  const getObject = useMethod(RenderedObjectService, 'get');

  const [scope, ...restScope] = useMemo(
    () => new Set(selected.map(objectId => getObject(objectId)!.info.scope)),
    [selected, getObject]
  );

  function renderBody() {
    if (restScope.length > 0) return 'Multiple scopes selected';

    return (
      <Group>
        <GroupTitle>View</GroupTitle>
        <Label>Scope Name</Label>
        {scope}
      </Group>
    );
  }

  return <>{renderBody()}</>;
};

export default ViewInfo;
