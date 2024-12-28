export enum OsEventType {
  FOCUS = 'CATA::FOCUS_EV',
  MAXIMIZE = 'CATA::MAXIMIZE_EV',
  UNMAXIMIZE = 'CATA::UNMAXIMIZE_EV',
}

export const getOsFocusEvent = (key: string) =>
  new CustomEvent(OsEventType.FOCUS, { bubbles: false, detail: { key } });
export const getOsMaximizeEvent = (key: string) =>
  new CustomEvent(OsEventType.MAXIMIZE, { bubbles: false, detail: { key } });
export const getOsUnmaximizeEvent = (key: string, shift: boolean = true) =>
  new CustomEvent(OsEventType.UNMAXIMIZE, {
    bubbles: false,
    detail: { key, shift },
  });
