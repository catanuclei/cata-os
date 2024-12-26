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

  public constructor(managerNode: HTMLElement) {
    this._managerNode = managerNode;
  }

  public createWindow = (title: string): WindowResponse => {
    const key = this._generateWindowKey();
    const windowNode = _createWindowNode({ title });
    this._managerNode.appendChild(windowNode);
    return { key };
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

const _createWindowNode = ({ title }: WindowInfo): HTMLElement => {
  const node = document.createElement('div')!;
  const titleNode = document.createElement('p')!;

  node.classList.add(WINDOW_CLASS);
  titleNode.classList.add(WINDOW_TITLE_CLASS);
  titleNode.innerHTML = title;
  titleNode.appendChild(createIcon('x'));
  node.appendChild(titleNode);

  return node;
};
