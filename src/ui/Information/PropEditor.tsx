import React from 'react';
import { ScaffoldId } from 'base/id';
import { PropMetadata } from 'editor/type';
import { useMethodCall } from 'editor/di';
import { WidgetService } from 'editor/widget/WidgetService';
import { Field, Label } from 'ui/components/Form';
import useProp from 'ui/hooks/useProp';

function getLabel(propKey: string) {
  return propKey
    .replace(/([A-Z])/g, letter => ` ${letter.toLowerCase()}`)
    .replace(/\D\d/, letter => `${letter[0]} ${letter[1]}`);
}

export interface PropEditorProps {
  propKey: string;
  metadata: PropMetadata;
  scaffoldId: ScaffoldId;
}

const PropEditor: React.FC<PropEditorProps> = props => {
  const {
    scaffoldId,
    propKey,
    metadata: { type, defaultValue, options, label },
  } = props;

  const inputWidget = useMethodCall(WidgetService, 'getInputWidget', [type]);

  const [value, setValue] = useProp(scaffoldId, propKey);

  function renderInput() {
    if (!inputWidget) return `unknown input type: ${type}`;

    return (
      <inputWidget.render value={value || defaultValue} onChange={setValue} options={options} />
    );
  }

  return (
    <Field>
      <Label>{label || getLabel(propKey)}</Label>
      {renderInput()}
    </Field>
  );
};

export default PropEditor;
