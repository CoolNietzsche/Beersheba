import * as _React from 'react';

declare global {
  const React: typeof _React;
  namespace React {
    type CSSProperties = _React.CSSProperties;
    type ReactNode = _React.ReactNode;
    type FormEvent<T = Element> = _React.FormEvent<T>;
    type ChangeEvent<T = Element> = _React.ChangeEvent<T>;
    type ClipboardEvent<T = Element> = _React.ClipboardEvent<T>;
    type DragEvent<T = Element> = _React.DragEvent<T>;
    type FocusEvent<T = Element> = _React.FocusEvent<T>;
    type KeyboardEvent<T = Element> = _React.KeyboardEvent<T>;
    type MouseEvent<T = Element> = _React.MouseEvent<T>;
    type TouchEvent<T = Element> = _React.TouchEvent<T>;
    type PointerEvent<T = Element> = _React.PointerEvent<T>;
    type WheelEvent<T = Element> = _React.WheelEvent<T>;
    type AnimationEvent<T = Element> = _React.AnimationEvent<T>;
    type TransitionEvent<T = Element> = _React.TransitionEvent<T>;
  }
}
export {};
