import { Service } from 'typedi';
import { ChildrenConstraint } from 'editor/type';
import { EditorService } from 'editor/EditorService';
import builtInMetadata from 'editor/built-in-metadata';

@Service()
export class ComponentService {
  constructor(private editor: EditorService) {}

  getMetadata(type: string) {
    const componentModule = this.editor.container.get(type);
    if (componentModule) return componentModule.metadata || {};
    return builtInMetadata[type] || {};
  }

  getTypeNames() {
    return this.editor.container.getIds();
  }

  getComponentType(type: string) {
    const componentType = this.editor.container.get(type);
    if (!componentType) throw new Error('not found component type');
    return componentType;
  }

  getChildrenConstraint(type: string): ChildrenConstraint {
    const metadata = this.getMetadata(type);
    if (!metadata.constraint) return {};
    return metadata.constraint.children || {};
  }
}
