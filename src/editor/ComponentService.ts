import { Service } from 'typedi';
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
}
