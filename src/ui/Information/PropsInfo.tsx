import React, { useMemo } from 'react';
import * as object from 'base/object';
import { useProperty$, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { BlueprintService } from 'editor/BlueprintService';
import builtInMetadata from 'editor/built-in-metadata';
import { FieldSet, Legend } from 'ui/components/Form';
import PropEditor from 'ui/widget/PropEditor';

const PropsInfo: React.FC = () => {
  const [selected, ...restSelected] = useProperty$(EditorStateService, 'selected$', []);

  const blueprint = useMethodCall(BlueprintService, 'get', [selected || '']);

  const metadata = useMemo(() => {
    if (!blueprint) return;
    return builtInMetadata[blueprint.type];
  }, [blueprint]);

  const groups = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!metadata || !metadata.props) return result;
    // make sure default is first group
    result.set('default', []);
    const allKeys = object.keys(metadata.props);
    for (const key of allKeys) {
      if (/^style./.test(key)) continue;
      const groupName = metadata.props[key].uiGroup || 'default';
      const group = result.get(groupName) || [];
      result.set(groupName, group);
      group.push(key);
    }
    return result;
  }, [metadata]);

  function renderProp(propKey: string) {
    return (
      <PropEditor
        key={propKey}
        propKey={propKey}
        metadata={metadata!.props![propKey]}
        blueprintId={blueprint!.id}
      />
    );
  }

  function renderGroup(groupName: string) {
    const keys = groups.get(groupName)!;
    return (
      <FieldSet key={groupName}>
        <Legend>{groupName}</Legend>
        {keys.map(renderProp)}
      </FieldSet>
    );
  }

  function renderBody() {
    if (restSelected.length > 0) return 'Multiple object selected';

    if (!blueprint) return 'Not found blueprint';

    return Array.from(groups.keys()).map(renderGroup);
  }

  return <>{renderBody()}</>;
};

export default PropsInfo;
