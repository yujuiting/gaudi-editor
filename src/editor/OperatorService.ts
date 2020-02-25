import { Service } from 'typedi';
import { map, startWith } from 'rxjs/operators';
import { JSONValue, Blueprint } from 'gaudi';
import { HistoryService } from 'editor/HistoryService';
import { BlueprintService, filterPropUpdateEvent } from 'editor/BlueprintService';

@Service()
export class OperatorService {
  constructor(private history: HistoryService, private blueprint: BlueprintService) {}

  getBlueprintProp<T extends JSONValue>(id: string, key: string) {
    return this.blueprint.getProp<T>(id, key);
  }

  getBlueprintProp$<T extends JSONValue>(id: string, key: string) {
    return this.blueprint.updateEvent$.pipe(
      filterPropUpdateEvent(id, key),
      map(e => e.value as T),
      startWith(this.getBlueprintProp<T>(id, key))
    );
  }

  updateBlueprintProp(id: string, key: string, value: JSONValue) {
    const oldValue = this.getBlueprintProp(id, key);
    this.history.push({
      label: `Update prop: ${key.replace('.', ' ')}`,
      prev: { id, key, value: oldValue },
      next: { id, key, value },
      execute: args => this.blueprint.updateProp(args.id, args.key, args.value),
    });
  }

  /**
   * insert from tail as default
   */
  insertBlueprintChild(id: string, blueprint: Blueprint, at?: number) {
    const finalAt = at || this.blueprint.getChildrenCount(id);
    this.history.push({
      label: 'Insert child',
      do: () => this.blueprint.insertChild(id, blueprint, finalAt),
      undo: () => this.blueprint.removeChild(id, finalAt),
    });
  }

  removeBlueprintChild(id: string, at: number) {
    const child = this.blueprint.getChildAt(id, at);
    if (!child) throw new Error();
    this.history.push({
      label: 'Remove child',
      do: () => this.blueprint.removeChild(id, at),
      undo: () => this.blueprint.insertChild(id, child, at),
    });
  }
}
