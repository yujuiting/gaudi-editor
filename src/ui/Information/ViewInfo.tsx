import React, { useCallback } from 'react';
import useCurrentScope from 'ui/hooks/useCurrentScope';
import useViewRect from 'ui/hooks/useViewRect';
import { FieldSet, Legend, Label, Field } from 'ui/components/Form';
import { InputNumber } from 'ui/widget/inputs';

const ViewInfo: React.FC = () => {
  const scope = useCurrentScope();

  const [{ size }, updateSize] = useViewRect(scope || '');

  const setWidth = useCallback((width: number) => updateSize(size.setWidth(width)), [
    updateSize,
    size,
  ]);

  const setHeight = useCallback((height: number) => updateSize(size.setHeight(height)), [
    updateSize,
    size,
  ]);

  function renderBody() {
    if (!scope) return 'No view selected';

    return (
      <FieldSet>
        <Legend>View</Legend>
        <Field>
          <Label>Scope Name</Label>
          {scope}
        </Field>
        <Field>
          <Label>Width</Label>
          <InputNumber value={size.width || 0} onChange={setWidth} />
        </Field>
        <Field>
          <Label>Height</Label>
          <InputNumber value={size.height || 0} onChange={setHeight} />
        </Field>
      </FieldSet>
    );
  }

  return <>{renderBody()}</>;
};

export default ViewInfo;
