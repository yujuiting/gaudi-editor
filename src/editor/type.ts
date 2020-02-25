export interface ComponentMetadata {
  props?: Record<string, PropMetadata>;
}

interface InternalPropMetadata<Type extends string, DefaultValue> {
  type: Type;
  defaultValue?: DefaultValue;
  options?: { label: string; value: DefaultValue; default?: boolean }[];
  uiGroup?: string;
  uiLabel?: string;
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
