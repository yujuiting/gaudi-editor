import React, { useEffect, useState } from 'react';
import { RendererService } from 'editor/RendererService';
import { useMethodCall, useMethod } from 'editor/di';

export interface Props {
  rootName: string;
}

const Blueprint: React.FC<Props> = props => {
  const { rootName } = props;

  const [, update] = useState(0);

  const element = useMethodCall(RendererService, 'getElement', [rootName]);

  const watch = useMethod(RendererService, 'watch');

  useEffect(() => {
    const subscription = watch(rootName).subscribe(() => {
      update(c => c + 1);
    });
    return () => subscription.unsubscribe();
  }, [watch, rootName]);

  return <div>{element}</div>;
};

export default Blueprint;
