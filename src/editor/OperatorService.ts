import { Service } from 'typedi';
import { JSONValue, Blueprint } from 'gaudi';
import { HistoryService } from 'base/HistoryService';
import { BlueprintService } from 'editor/BlueprintService';

@Service()
export class OperatorService {
  constructor(private history: HistoryService, private blueprint: BlueprintService) {}

  updateBlueprintProp(id: string, key: string, value: JSONValue) {
    const target = this.blueprint.get(id);
    if (!target) throw new Error();
    const oldValue = target.props[key];
    this.history.push({
      label: `Update prop ${key}`,
      do: () => this.blueprint.updateProp(id, key, value),
      undo: () => this.updateBlueprintProp(id, key, oldValue),
    });
  }

  /**
   * insert from tail as default
   */
  insertBlueprintChild(id: string, blueprint: Blueprint, at?: number) {
    const target = this.blueprint.get(id);
    if (!target) throw new Error();
    const finalAt = at || target.children.length;
    this.history.push({
      label: 'Insert child',
      do: () => this.blueprint.insertChild(id, blueprint, finalAt),
      undo: () => this.blueprint.removeChild(id, finalAt),
    });
  }

  removeBlueprintChild(id: string, at: number) {
    const target = this.blueprint.get(id);
    if (!target) throw new Error();
    if (target.children.length <= at) throw new Error();
    const child = target.children[at];
    this.history.push({
      label: 'Remove child',
      do: () => this.blueprint.removeChild(id, at),
      undo: () => this.blueprint.insertChild(id, child, at),
    });
  }
}
