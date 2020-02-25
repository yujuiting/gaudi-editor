import React from 'react';
import { PropMetadata } from 'editor/type';
import { useMethodCall } from 'editor/di';
import { Field, Label } from 'ui/components/Form';
import useProp from 'ui/hooks/useProp';
import { WidgetService } from 'editor/widget/WidgetService';

function getLabel(propKey: string) {
  return propKey
    .replace('style.', '')
    .replace(
      // safari does not support positive lookbehind ?<= operator
      // /([A-Z]|(?<=\D)\d)/g,
      /([A-Z])/g,
      letter => ` ${letter.toLowerCase()}`
    )
    .replace(/\D\d/, letter => `${letter[0]} ${letter[1]}`);
}

export interface PropEditorProps {
  propKey: string;
  metadata: PropMetadata;
  blueprintId: string;
}

const PropEditor: React.FC<PropEditorProps> = props => {
  const {
    blueprintId,
    propKey,
    metadata: { type, defaultValue, options, uiLabel },
  } = props;

  const inputWidget = useMethodCall(WidgetService, 'getInputWidget', [type]);

  const [value, setValue] = useProp(blueprintId, propKey);

  function renderInput() {
    if (!inputWidget) return `unknown input type: ${type}`;

    return (
      <inputWidget.render value={value || defaultValue} onChange={setValue} options={options} />
    );
  }

  return (
    <Field>
      <Label>{uiLabel || getLabel(propKey)}</Label>
      {renderInput()}
    </Field>
  );
};

export default PropEditor;
