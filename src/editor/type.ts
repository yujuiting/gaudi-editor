export interface ComponentMetadata {
  props?: Record<string, PropMetadata>;
}

interface InternalPropMetadata<Type extends string, DefaultValue> {
  type: Type;
  defaultValue?: DefaultValue;
  options?: { label: string; value: DefaultValue; default?: boolean }[];
}

export type PropMetadata =
  | InternalPropMetadata<'string', string>
  | InternalPropMetadata<'number', number>
  | InternalPropMetadata<'datetime', Date>
  | InternalPropMetadata<'boolean', boolean>
  | InternalPropMetadata<'color', string>
  | InternalPropMetadata<'length', string>
  | InternalPropMetadata<'css', string>
  | InternalPropMetadata<'js', string>
  | InternalPropMetadata<'any', string>;

export type PossiblePropType = PropMetadata extends { type: infer T } ? T : never;
