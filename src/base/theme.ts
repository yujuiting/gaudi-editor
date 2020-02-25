import { ThemeProps, FlattenInterpolation } from 'styled-components';

export function get<T extends object>(key: keyof T, defaultValue?: string) {
  return function(props: ThemeProps<T>): T[keyof T] | string | undefined {
    const result = typeof props.theme[key] !== void 0 ? props.theme[key] : defaultValue;
    if (typeof result === 'string' && /^\$/.test(result)) {
      return get<T>(result.replace(/^\$/, '') as keyof T, defaultValue)(props);
    }
    return result;
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
