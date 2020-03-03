import { Children, isValidElement, cloneElement, useRef, useEffect, forwardRef } from 'react';
import { RenderingInfo } from 'gaudi';
import { MutableBlueprint } from 'editor/BlueprintService';
import { ElementService } from 'editor/ElementService';
import { useMethod } from 'editor/di';

export interface Props {
  info: RenderingInfo;
  blueprint: MutableBlueprint;
}

const Scaffold = forwardRef<HTMLElement, Props>(({ children, info, blueprint }, ref) => {
  const child = Children.only(children);

  const add = useMethod(ElementService, 'add');

  const innerRef = useRef<HTMLElement>(null);

  useEffect(() => add(blueprint.id, info, innerRef), [add, blueprint, info, innerRef]);

  useEffect(() => {
    if (ref === null) return;
    if (typeof ref === 'function') ref(innerRef.current);
    else (ref as any).current = innerRef.current;
  }, [ref, innerRef]);

  if (!isValidElement(child)) return null;

  return cloneElement(child, { ref: innerRef });
});

export default Scaffold;
