import React, { useMemo } from 'react';
import * as object from 'base/object';
import { useProperty$, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { BlueprintService } from 'editor/BlueprintService';
import builtInMetadata from 'editor/built-in-metadata';
import { Group, GroupTitle } from 'ui/components/Information';
import { Label } from 'ui/components/Input';
import PropEditor from 'ui/widget/editor/PropEditor';

const PropsInfo: React.FC = () => {
  const [selected, ...restSelected] = useProperty$(EditorStateService, 'selected$', []);

  const blueprint = useMethodCall(BlueprintService, 'get', [selected || '']);

  const metadata = useMemo(() => {
    if (!blueprint) return;
    return builtInMetadata[blueprint.type];
  }, [blueprint]);

  const keys = useMemo(() => {
    if (!metadata || !metadata.props) return [];
    return object.keys(metadata.props);
  }, [metadata]);

  function renderProp(propKey: string) {
    return (
      <div key={propKey}>
        <Label>{propKey}</Label>
        <PropEditor
          propKey={propKey}
          metadata={metadata!.props![propKey]}
          blueprintId={blueprint!.id}
        />
      </div>
    );
  }

  function renderBody() {
    if (restSelected.length > 0) return 'Multiple object selected';

    if (!blueprint) return 'Not found blueprint';

    return (
      <Group>
        <GroupTitle>Basis</GroupTitle>
        {keys.map(renderProp)}
      </Group>
    );
  }

  return <>{renderBody()}</>;
};

export default PropsInfo;
