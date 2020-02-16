import { Children, isValidElement, cloneElement, useRef, useEffect } from 'react';
import { RenderingInfo } from 'gaudi';
import { MutableBlueprint } from 'editor/BlueprintService';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import { useMethod } from 'editor/di';

export interface ScaffoldProps {
  info: RenderingInfo;
  blueprint: MutableBlueprint;
}

const Scaffold: React.FC<ScaffoldProps> = ({ children, info, blueprint }) => {
  const child = Children.only(children);

  const add = useMethod(RenderedObjectService, 'add');

  const ref = useRef<HTMLElement>();

  useEffect(() => add(blueprint.id, info, ref), [add, blueprint, info, ref]);

  if (!isValidElement(child)) return null;

  return cloneElement(child, { ref });
};

export default Scaffold;
