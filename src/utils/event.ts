export enum OsEventType {
  FOCUS = 'CATA::FOCUS_EV',
}

export const getOsFocusEvent = (key: string) =>
  new CustomEvent(OsEventType.FOCUS, { bubbles: false, detail: { key } });
