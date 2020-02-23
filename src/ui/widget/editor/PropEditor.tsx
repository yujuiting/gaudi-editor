import React, { useCallback, useMemo } from 'react';
import { JSONValue } from 'gaudi';
import { PropMetadata } from 'editor/type';
import { OperatorService } from 'editor/OperatorService';
import { useMethodCall, useMethod } from 'editor/di';
import { Input, Select, Option } from 'ui/components/Input';
import { useObservable } from 'rxjs-hooks';

interface SimpleInput<T = any> {
  value: T;
  onChange: (value: T) => void;
}

interface SimpleSelect<T = any> extends SimpleInput<T> {
  options: { label: string; value: T; default?: boolean }[];
}

const InputNumber: React.FC<SimpleInput<number>> = props => {
  const { value, onChange } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value)),
    [onChange]
  );
  return <Input value={`${value}`} onChange={wrappedOnChange} />;
};

const InputString: React.FC<SimpleInput<string>> = props => {
  const { value, onChange } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );
  return <Input value={value || ''} onChange={wrappedOnChange} />;
};

const InputDate: React.FC<SimpleInput<Date>> = props => {
  const { value, onChange } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(new Date(e.target.value)),
    [onChange]
  );
  return <Input type="datetime-local" value={value.toLocaleString()} onChange={wrappedOnChange} />;
};

const InputBoolean: React.FC<SimpleInput<boolean>> = props => {
  const { value, onChange } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
    [onChange]
  );
  return <Input type="checkbox" checked={value} onChange={wrappedOnChange} />;
};

const SelectString: React.FC<SimpleSelect<string>> = props => {
  const { value, onChange, options } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
    [onChange]
  );
  const defaultValue = useMemo(() => options.find(option => option.default), [options]);
  return (
    // to force render default value if input value is undefined
    <Select value={value || defaultValue?.value} onChange={wrappedOnChange}>
      {options.map(({ label, value }) => (
        <Option key={value} value={value}>
          {label}
        </Option>
      ))}
    </Select>
  );
};

export interface PropEditorProps {
  propKey: string;
  metadata: PropMetadata;
  blueprintId: string;
}

const PropEditor: React.FC<PropEditorProps> = props => {
  const {
    blueprintId,
    propKey,
    metadata: { type, defaultValue, options },
  } = props;
  const getBlueprintProp$ = useMethod(OperatorService, 'getBlueprintProp$');
  const updateBlueprintProp = useMethod(OperatorService, 'updateBlueprintProp');

  const value = useObservable(() => getBlueprintProp$(blueprintId, propKey), undefined, [
    blueprintId,
    propKey,
  ]);

  const onChange = useCallback(
    (value: JSONValue) => updateBlueprintProp(blueprintId, propKey, value),
    [updateBlueprintProp, blueprintId, propKey]
  );

  if (options) {
    let Select: React.JSXElementConstructor<SimpleSelect>;

    switch (type) {
      case 'number':
      case 'datetime':
      case 'boolean':
      case 'string':
      case 'color':
      case 'length':
      case 'css':
      case 'js':
      case 'any':
      default:
        Select = SelectString;
        break;
    }

    return <Select value={value || defaultValue} onChange={onChange} options={options} />;
  }

  let Input: React.JSXElementConstructor<SimpleInput>;

  switch (type) {
    case 'number':
      Input = InputNumber;
      break;
    case 'datetime':
      Input = InputDate;
      break;
    case 'boolean':
      Input = InputBoolean;
      break;
    case 'string':
    case 'color':
    case 'length':
    case 'css':
    case 'js':
    case 'any':
    default:
      Input = InputString;
      break;
  }

  return <Input value={value || defaultValue} onChange={onChange} />;
};

export default PropEditor;
