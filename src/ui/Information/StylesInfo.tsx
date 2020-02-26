import React, { useMemo } from 'react';
import * as object from 'base/object';
import builtInMetadata from 'editor/built-in-metadata';
import { FieldSet, Legend } from 'ui/components/Form';
import PropEditor from 'ui/widget/PropEditor';
import useSelected from 'ui/hooks/useSelected';
import useBlueprint from 'ui/hooks/useBlueprint';

interface StylesInfoContentProps {
  selected: string;
}

const StylesInfoContent: React.FC<StylesInfoContentProps> = props => {
  const { selected } = props;

  const blueprint = useBlueprint(selected);

  const metadata = useMemo(() => builtInMetadata[blueprint.type], [blueprint]);

  const groups = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!metadata || !metadata.props) return result;
    // make sure default is first group
    result.set('default', []);
    const allKeys = object.keys(metadata.props);
    for (const key of allKeys) {
      if (!/^style./.test(key)) continue;
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
        blueprintId={blueprint.id}
      />
    );
  }

  function renderGroup(groupName: string) {
    const keys = groups.get(groupName)!;
    if (keys.length === 0) return null;
    return (
      <FieldSet key={groupName}>
        <Legend>{groupName}</Legend>
        {keys.map(renderProp)}
      </FieldSet>
    );
  }

  function renderBody() {
    return Array.from(groups.keys()).map(renderGroup);
  }

  return <>{renderBody()}</>;
};

const StylesInfo: React.FC = () => {
  const [selected, ...restSelected] = useSelected();

  function renderBody() {
    if (restSelected.length > 0) return 'Multiple object selected';

    if (!selected) return 'No selection';

    return <StylesInfoContent selected={selected} />;
  }

  return <>{renderBody()}</>;
};

export default StylesInfo;
