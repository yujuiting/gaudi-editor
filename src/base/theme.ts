import { ThemeProps, FlattenInterpolation } from 'styled-components';

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
