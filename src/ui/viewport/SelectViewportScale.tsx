import React, { useMemo, useCallback } from 'react';
import { useObservable } from 'rxjs-hooks';
import { unique } from 'base/array';
import { useProperty, useMethod } from 'editor/di';
import { ViewportService } from 'editor/ViewportService';
import { Select, Option } from 'ui/components/Select';

const toDisplayText = (value: number) => `${(value * 100).toFixed(0)} %`;

const toScale = (value: string) => parseFloat(value) * 0.01;

const optionScales = [0.5, 0.75, 1, 1.25, 1.5];

const SelectViewportScale: React.FC = () => {
  const scale$ = useProperty(ViewportService, 'scale$');

  const setScale = useMethod(ViewportService, 'setScale');

  const scale = useObservable(() => scale$, 1);

  const value = useMemo(() => toDisplayText(scale), [scale]);

  const options = useMemo(() => [...optionScales, scale].sort(), [scale]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setScale(toScale(e.target.value)),
    [setScale]
  );

  function renderOptions(text: string) {
    return (
      <Option value={text} key={text}>
        {text}
      </Option>
    );
  }

  return (
    <Select onChange={onChange} value={value}>
      {unique(options.map(toDisplayText)).map(renderOptions)}
    </Select>
  );
};

export default SelectViewportScale;
