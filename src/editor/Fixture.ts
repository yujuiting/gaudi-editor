import { Children, isValidElement, cloneElement, useRef, useEffect } from 'react';
import { RenderingInfo } from 'gaudi';
import { useService } from 'base/di';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import { MutableTemplate } from 'editor/TemplateService';

export interface ScaffoldProps {
  info: RenderingInfo;
  template: MutableTemplate;
}

const Fixture: React.FC<ScaffoldProps> = ({ children, info, template }) => {
  const child = Children.only(children);

  const renderedObject = useService(RenderedObjectService);

  const ref = useRef<HTMLElement>();

  useEffect(() => renderedObject.add(template.id, info, ref), [
    renderedObject,
    template,
    info,
    ref,
  ]);

  if (!isValidElement(child)) return null;

  return cloneElement(child, { ref });
};

export default Fixture;
