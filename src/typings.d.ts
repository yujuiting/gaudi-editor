// import 'styled-components';

declare type RequestIdleCallbackHandle = number;
declare type RequestIdleCallbackOptions = {
  timeout: number;
};
declare type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

declare interface Window {
  requestIdleCallback: (
    callback: (deadline: RequestIdleCallbackDeadline) => void,
    opts?: RequestIdleCallbackOptions
  ) => RequestIdleCallbackHandle;
  cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
}

declare type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

declare type RestrictArray<T> = T extends unknown[] ? T : [];
