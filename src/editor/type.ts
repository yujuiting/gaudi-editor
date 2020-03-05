declare module 'gaudi/ComponentModule' {
  export interface ComponentModule {
    metadata?: ComponentMetadata;
  }
}

export interface ComponentMetadata {
  props?: Record<string, PropMetadata>;
  constraint?: {
    children?: ChildrenConstraint;
  };
}

interface InternalPropMetadata<Type extends string, DefaultValue> {
  category: string;
  group?: string;
  label?: string;
  type: Type;
  defaultValue?: DefaultValue;
  options?: { label: string; value: DefaultValue; default?: boolean }[];
}

export type PropMetadata =
  | InternalPropMetadata<'string', string>
  | InternalPropMetadata<'number', number>
  | InternalPropMetadata<'datetime', number>
  | InternalPropMetadata<'boolean', boolean>
  | InternalPropMetadata<'color', string>
  | InternalPropMetadata<'length', string>
  | InternalPropMetadata<'css', string>
  | InternalPropMetadata<'js', string>
  | InternalPropMetadata<'border', string>
  | InternalPropMetadata<'any', string>;

export type PossiblePropType = PropMetadata extends { type: infer T } ? T : never;

export interface ChildrenConstraint {
  max?: number;
  forbids?: string[];
  accepts?: string[];
}
