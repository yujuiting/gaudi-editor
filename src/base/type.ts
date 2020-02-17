export type ExtractTypeOf<T, U> = { [key in keyof T]: T[key] extends U ? key : never }[keyof T];

export type ExcludeTypeOf<T, U> = { [key in keyof T]: T[key] extends U ? never : key }[keyof T];
