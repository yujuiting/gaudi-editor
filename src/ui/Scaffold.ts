import {
  Children,
  isValidElement,
  cloneElement,
  useRef,
  useEffect,
  forwardRef,
  createElement,
  Fragment,
} from 'react';
import { RenderingInfo } from 'gaudi';
import { MutableBlueprint } from 'editor/BlueprintService';
import { ElementService } from 'editor/ElementService';
import { useMethod } from 'editor/di';
import { getElementId } from 'editor/ElementService';
import useMetadata from 'ui/hooks/useMetadata';
import useResizer from 'ui/hooks/resize/useResizer';
import useSelected from 'ui/hooks/useSelected';

export interface Props {
  info: RenderingInfo;
  blueprint: MutableBlueprint;
}

const Scaffold = forwardRef<HTMLElement, Props>(({ children, info, blueprint }, ref) => {
  const metadata = useMetadata(blueprint.type);

  const selected = useSelected();

  const child = Children.only(children);

  const add = useMethod(ElementService, 'add');

  const innerRef = useRef<HTMLElement>(null);

  useEffect(() => add(blueprint.id, info, innerRef), [add, blueprint, info, innerRef]);

  useEffect(() => {
    if (ref === null) return;
    if (typeof ref === 'function') ref(innerRef.current);
    else (ref as any).current = innerRef.current; // eslint-disable-line @typescript-eslint/no-explicit-any
  }, [ref, innerRef]);

  if (!isValidElement(child)) return null;

  const elemets: React.ReactChild[] = [cloneElement(child, { ref: innerRef })];

  const isSelected = selected.includes(getElementId(info.scope, blueprint.id));

  // metadata will not be changed in runtime, it's safe to use hooks here
  if (metadata.resizable) {
    const renderResizer = useResizer({ id: info.id });
    if (isSelected) elemets.push(...renderResizer());
  }

  return createElement(Fragment, {}, ...elemets);
});

export default Scaffold;
