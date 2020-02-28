import React, { useMemo } from 'react';
import * as object from 'base/object';
import { FieldSet, Legend, Field, Label } from 'ui/components/Form';
import useMetadata from 'ui/hooks/useMetadata';
import useSelected from 'ui/hooks/useSelected';
import useBlueprint from 'ui/hooks/useBlueprint';
import PropEditor from './PropEditor';

interface PropsInfoContentProps {
  selected: string;
  category: string;
  showInfo?: boolean;
}

const PropsInfoContent: React.FC<PropsInfoContentProps> = props => {
  const { selected, category, showInfo } = props;

  const blueprint = useBlueprint(selected);

  const metadata = useMetadata(blueprint.type);

  const groups = useMemo(() => {
    const result = new Map<string, string[]>();
    if (!metadata.props) return result;
    // make sure default is first group
    result.set('default', []);
    const allKeys = object.keys(metadata.props);
    for (const key of allKeys) {
      const propMetadata = metadata.props[key];
      if (propMetadata.category !== category) continue;
      const groupName = metadata.props[key].group || 'default';
      const group = result.get(groupName) || [];
      result.set(groupName, group);
      group.push(key);
    }
    return result;
  }, [metadata, category]);

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

  function renderInfo() {
    return (
      <FieldSet>
        <Legend>Info</Legend>
        <Field>
          <Label>id</Label>
          {selected}
        </Field>
        <Field>
          <Label>blueprint id</Label>
          {blueprint.id}
        </Field>
      </FieldSet>
    );
  }

  function renderBody() {
    return Array.from(groups.keys()).map(renderGroup);
  }

  return (
    <>
      {showInfo && renderInfo()}
      {renderBody()}
    </>
  );
};

interface Props {
  category: string;
  showInfo?: boolean;
}

const PropsInfo: React.FC<Props> = props => {
  const { category, showInfo } = props;

  const [selected, ...restSelected] = useSelected();

  function renderBody() {
    if (restSelected.length > 0) return 'Multiple object selected';

    if (!selected) return 'No selection';

    return <PropsInfoContent selected={selected} category={category} showInfo={showInfo} />;
  }

  return <>{renderBody()}</>;
};

export default PropsInfo;
