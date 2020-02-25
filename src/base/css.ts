import { FlattenInterpolation } from 'styled-components';
import * as object from 'base/object';

export const builtInLength = [
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
export const lengthUnits = object.keys(lengthRegexp);
export type LengthUnit = typeof lengthUnits[number];

export function isLength(value: string): boolean {
  if (isLexicalLength(value)) return true;
  for (const lengthUnit of lengthUnits) {
    if (lengthRegexp[lengthUnit].test(value)) return true;
  }
  return false;
}

export function getLength(
  value?: string | number,
  unit: LengthUnit = 'px',
  defaultValue: LexicalLength | string | number = 'initial'
): string {
  switch (typeof value) {
    case 'number':
      return `${value}${unit}`;
    case 'string': {
      if (isLength(value)) return value;
      break;
    }
    default:
      break;
  }
  return getLength(defaultValue, unit);
}

export function getLengthNumber(value?: string) {
  if (!value) return;
  if (!isLength(value)) return;
  const [numberPart] = /\d+/.exec(value)!;
  return numberPart;
}

export function getLengthUnit(value?: string) {
  if (!value) return;
  if (!isLength(value)) return;
  const [unit] = /\D+/.exec(value)!;
  return unit;
}

export function ifDefined<T extends object, K extends keyof T>(
  key: K,
  fn: (props: T) => FlattenInterpolation<T>
) {
  return (props: T) => {
    if (!props[key]) return;
    return fn(props);
  };
}
