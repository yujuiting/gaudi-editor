import React, { useMemo, useCallback } from 'react';
import { useObservable } from 'rxjs-hooks';
import { unique } from 'base/array';
import { useService } from 'base/di';
import { Select, Option } from 'base/components/Select';
import { ViewportService } from 'editor/viewport/ViewportService';

const toDisplayText = (value: number) => `${(value * 100).toFixed(0)} %`;

const toScale = (value: string) => parseFloat(value) * 0.01;

const optionScales = [0.5, 0.75, 1, 1.25, 1.5];

const SelectViewportScale: React.FC = () => {
  const viewport = useService(ViewportService);

  const scale = useObservable(() => viewport.scale$, 1);

  const value = useMemo(() => toDisplayText(scale), [scale]);

  const options = useMemo(() => [...optionScales, scale].sort(), [scale]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => viewport.setScale(toScale(e.target.value)),
    [viewport]
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
