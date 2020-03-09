import { Blueprint, JSONObject } from 'gaudi';
import { ScaffoldId } from 'base/id';
import * as object from 'base/object';
import { Node } from 'base/Node';
import { Scaffold, BlueprintEx } from './types';

export function isBlueprint(value?: unknown): value is Blueprint {
  if (typeof value !== 'object') return false;
  if (value === null) return false;
  return typeof (value as Blueprint).type === 'string';
}

export function isScaffold(value?: unknown): value is Scaffold {
  if (typeof value !== 'object') return false;
  if (value === null) return false;
  return (value as Scaffold).id !== void 0;
}

interface ScaffoldData {
  // scaffold id => scaffold
  scaffolds: Map<ScaffoldId, Scaffold>;
  // relations
  nodes: Map<ScaffoldId, Node<ScaffoldId>>;
  // node holded id
  root: Node<ScaffoldId>;
}

export function toScaffold(blueprint: Blueprint): ScaffoldData {
  const scaffold: Scaffold = {
    id: ScaffoldId.new(),
    type: blueprint.type,
    props: blueprint.props || {},
  };

  const scaffolds = new Map<ScaffoldId, Scaffold>();
  const nodes = new Map<ScaffoldId, Node<ScaffoldId>>();
  const root = Node.of(scaffold.id);

  scaffolds.set(scaffold.id, scaffold);
  nodes.set(scaffold.id, root);

  const result: ScaffoldData = { scaffolds, nodes, root };

  if (!blueprint.children) return result;

  for (const child of blueprint.children) {
    const { scaffolds, nodes, root } = toScaffold(child);
    result.scaffolds = new Map([...result.scaffolds, ...scaffolds]);
    result.nodes = new Map([...result.nodes, ...nodes]);
    result.root.insertChild(root);
  }

  return result;
}

export function toBlueprint({ scaffolds, nodes, root }: ScaffoldData): BlueprintEx {
  const target = scaffolds.get(root.value)!;
  const type = target.type;
  let props: JSONObject | undefined;
  let children: Blueprint[] | undefined;
  if (object.keys(target.props).length > 0) props = target.props;
  if (root.children.length > 0) {
    children = root.children.map(child => toBlueprint({ scaffolds, nodes, root: child }));
  }
  return { type, props, children, id: `${root.value}` };
}
