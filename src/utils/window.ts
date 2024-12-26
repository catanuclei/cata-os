import { createIcon } from './icon';

import { KEY_CHARACTERS } from './constants';

const WINDOW_CLASS = 'window';
const WINDOW_TITLE_CLASS = 'window__title';
const WINDOW_TITLE_ICON_CLASS = 'window__title__icon';
const WINDOW_TITLE_TEXT_CLASS = 'window__title__text';
const WINDOW_TITLE_BUTTONS_CLASS = 'window__title__buttons';
const WINDOW_TITLE_BUTTON_CLASS = 'window__title__button';
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
  const titleIconNode = document.createElement('span')!;
  const titleTextNode = document.createElement('span')!;
  const titleButtonsNode = document.createElement('div')!;
  const closeButtonNode = document.createElement('button')!;
  const closeIconNode = createIcon('x');

  node.classList.add(WINDOW_CLASS);
  titleNode.classList.add(WINDOW_TITLE_CLASS);
  titleIconNode.classList.add(WINDOW_TITLE_ICON_CLASS);
  titleTextNode.classList.add(WINDOW_TITLE_TEXT_CLASS);
  titleButtonsNode.classList.add(WINDOW_TITLE_BUTTONS_CLASS);
  closeButtonNode.classList.add(WINDOW_TITLE_BUTTON_CLASS);

  titleIconNode.appendChild(createIcon('window'));
  titleTextNode.innerHTML = title;
  closeIconNode.addEventListener('click', () => closeHandler(key));
  closeButtonNode.appendChild(closeIconNode);
  titleButtonsNode.appendChild(closeButtonNode);
  titleNode.appendChild(titleIconNode);
  titleNode.appendChild(titleTextNode);
  titleNode.appendChild(titleButtonsNode);

  titleNode.addEventListener('mousedown', (e) => {
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const baseX = e.clientX - node.offsetLeft;
    const baseY = e.clientY - node.offsetTop;

    const onMouseMove = (e: MouseEvent) => {
      const usedTop =
        e.clientY - baseY < 0
          ? 0
          : e.clientY - baseY >= window.innerHeight - height
            ? window.innerHeight - height
            : e.clientY - baseY;
      const usedLeft =
        e.clientX - baseX < 0
          ? 0
          : e.clientX - baseX >= window.innerWidth - width
            ? window.innerWidth - width
            : e.clientX - baseX;
      node.style.left = usedLeft + 'px';
      node.style.top = usedTop + 'px';
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  node.dataset.key = key;
  node.appendChild(titleNode);
  return node;
};
