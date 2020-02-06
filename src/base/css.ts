import * as object from 'base/object';

const builtInLength = [
  'initial',
  'inherit',
  'auto',
  'fit-content',
  'max-content',
  'min-content',
] as const;
export type LexicalLength = typeof builtInLength[number];
export function isLexicalLength(value: string): value is LexicalLength {
  return builtInLength.includes(value as LexicalLength);
}

const lengthRegexp = {
  px: /^\d+px$/,
  em: /^\d+em$/,
  rem: /^\d+rem$/,
  '%': /^\d+%$/,
  vh: /^\d+vh$/,
  vw: /^\d+vw$/,
};
const lengthUnit = object.keys(lengthRegexp);
export type LengthUnit = typeof lengthUnit[number];

export function getLength(
  value?: string | number,
  unit: LengthUnit = 'px',
  defaultValue: LexicalLength | number = 'initial'
): string {
  switch (typeof value) {
    case 'number':
      return `${value}${unit}`;
    case 'string': {
      if (isLexicalLength(value)) return value;
      if (lengthRegexp[unit].test(value)) return value;
      break;
    }
    default:
      break;
  }
  return getLength(defaultValue, unit);
}
