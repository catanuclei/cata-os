import { createIcon } from './icon';

import { KEY_CHARACTERS } from './constants';

const WINDOW_CLASS = 'window';
const WINDOW_TITLE_CLASS = 'window__title';
const WINDOW_KEY_LENGTH = 6;

interface WindowInfo {
  title: string;
}

interface WindowResponse {
  key: string;
}

export class WindowManager {
  private _managerNode: HTMLElement;
  private _windowMap: Record<string, WindowInfo>;

  public constructor(managerNode: HTMLElement) {
    this._managerNode = managerNode;
    this._windowMap = {};
  }

  public createWindow = (title: string): WindowResponse => {
    let key = this._generateWindowKey();
    while (this._windowMap[key]) {
      key = this._generateWindowKey();
    }
    const windowNode = _createWindowNode({ title }, key, this.closeWindow);
    this._managerNode.appendChild(windowNode);
    this._windowMap[key] = {
      title,
    };
    return { key };
  };

  public closeWindow = (key: string) => {
    if (!this._windowMap[key]) return;
    this._managerNode.querySelector(`[data-key="${key}"]`)?.remove();
    delete this._windowMap[key];
  };

  private _generateWindowKey = (): string => {
    let result = '';
    for (let i = 0; i < WINDOW_KEY_LENGTH; i++) {
      result +=
        KEY_CHARACTERS[Math.floor(Math.random() * KEY_CHARACTERS.length)];
    }
    return result;
  };
}

const _createWindowNode = (
  { title }: WindowInfo,
  key: string,
  closeHandler: (key: string) => void
): HTMLElement => {
  const node = document.createElement('div')!;
  const titleNode = document.createElement('p')!;
  const titleCloseNode = createIcon('x');

  node.dataset.key = key;
  titleNode.classList.add(WINDOW_TITLE_CLASS);
  titleNode.innerHTML = title;
  titleCloseNode.addEventListener('click', () => closeHandler(key));
  titleNode.appendChild(titleCloseNode);
  node.appendChild(titleNode);
  node.classList.add(WINDOW_CLASS);

  return node;
};
