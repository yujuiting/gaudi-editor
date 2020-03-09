import { Children, isValidElement, cloneElement, useRef, useEffect, forwardRef } from 'react';
import { RenderingInfo } from 'gaudi';
import { BlueprintEx } from 'editor/scaffold/types';
import { ElementService } from 'editor/ElementService';
import { useMethod } from 'editor/di';
import { ScaffoldId } from 'base/id';

export interface Props {
  info: RenderingInfo;
  blueprint: BlueprintEx;
}

const Scaffold = forwardRef<HTMLElement, Props>(({ children, info, blueprint }, ref) => {
  const child = Children.only(children);

  const add = useMethod(ElementService, 'add');

  const innerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // we inject id to blueprint when extract blueprint from scaffold
    const id = ScaffoldId.create(blueprint.id);
    return add(id, info, innerRef);
  }, [add, blueprint, info, innerRef]);

  useEffect(() => {
    if (ref === null) return;
    if (typeof ref === 'function') ref(innerRef.current);
    else (ref as any).current = innerRef.current; // eslint-disable-line @typescript-eslint/no-explicit-any
  }, [ref, innerRef]);

  if (!isValidElement(child)) return null;

  return cloneElement(child, { ref: innerRef });
});

export default Scaffold;
