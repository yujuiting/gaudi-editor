import React, { useCallback, useMemo } from 'react';
import * as css from 'base/css';
import { InputWidgetProps } from 'editor/widget/type';
import { Input, Select, Option } from 'ui/components/Form';
import { HStack } from 'ui/components/Stack';
import { Tool } from 'ui/components/Toolbar';
import * as Icons from 'ui/components/icons';

const noop = () => void 0;

export const SelectString: React.FC<InputWidgetProps<string>> = props => {
  const { value = '', onChange = noop, options = [] } = props;
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

export const InputNumber: React.FC<InputWidgetProps<number>> = props => {
  const { value = 0, onChange = noop } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value)),
    [onChange]
  );
  return <Input value={`${value}`} onChange={wrappedOnChange} />;
};

export const InputString: React.FC<InputWidgetProps<string>> = props => {
  const { value = '', onChange = noop, options = [] } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );
  if (options.length > 0) {
    return <SelectString {...props} />;
  }
  return <Input value={value} onChange={wrappedOnChange} />;
};

export const InputDate: React.FC<InputWidgetProps<number>> = props => {
  const { value = Date.now(), onChange = noop } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(new Date(e.target.value).valueOf()),
    [onChange]
  );
  return (
    <Input
      type="datetime-local"
      value={new Date(value).toLocaleString()}
      onChange={wrappedOnChange}
    />
  );
};

export const InputBoolean: React.FC<InputWidgetProps<boolean>> = props => {
  const { value = false, onChange = noop } = props;
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked),
    [onChange]
  );
  return <Input type="checkbox" checked={value} onChange={wrappedOnChange} />;
};

export const InputLength: React.FC<InputWidgetProps<string>> = props => {
  const { value = '', onChange = noop } = props;
  const invalid = useMemo(() => !!value && !css.isLength(value), [value]);
  const wrappedOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );
  return <Input value={value} invalid={invalid} onChange={wrappedOnChange} />;
};

export const InputColor: React.FC<InputWidgetProps<string>> = props => {
  const { value = '', onChange = noop } = props;

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange]
  );

  return (
    <HStack alignItems="center">
      <Input value={value} onChange={onInputChange} />
      <Tool>
        <Icons.Palette />
      </Tool>
    </HStack>
  );
};
