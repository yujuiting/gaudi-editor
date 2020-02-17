import { ThemeProps, FlattenInterpolation } from 'styled-components';
import { ExtractTypeOf } from 'base/type';

export function get<T extends object>(key: keyof T, defaultValue?: string) {
  return function(props: ThemeProps<T>) {
    return typeof props.theme[key] !== void 0 ? props.theme[key] : defaultValue;
  };
}

export function props<P extends object, T extends object>(
  key: keyof P,
  ifTrue: FlattenInterpolation<ThemeProps<T>>,
  ifFalse?: FlattenInterpolation<ThemeProps<T>>
) {
  return function(props: P & ThemeProps<T>) {
    return props[key] ? ifTrue : ifFalse;
  };
}

export function options<P extends object, T extends object, U>(
  prop: keyof P,
  prefix: string,
  fallbackValue: U
) {
  return (props: P & ThemeProps<T>) => {
    const key = `${prefix}.${props[prop]}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (key in props.theme) return (props.theme as any)[key];
    return fallbackValue;
  };
}
