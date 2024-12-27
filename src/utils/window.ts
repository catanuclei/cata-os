import { createIcon } from './icon';

import { OsEventType, getOsFocusEvent } from './event';
import { KEY_CHARACTERS } from './constants';

const WINDOW_CLASS = 'window';
const WINDOW_FOCUSED_CLASS = 'window--focused';
const WINDOW_TITLE_CLASS = 'window__title';
const WINDOW_TITLE_ICON_CLASS = 'window__title__icon';
const WINDOW_TITLE_TEXT_CLASS = 'window__title__text';
const WINDOW_TITLE_BUTTONS_CLASS = 'window__title__buttons';
const WINDOW_TITLE_BUTTON_CLASS = 'window__title__button';
const WINDOW_CONTENT_CLASS = 'window__content';
const WINDOW_KEY_LENGTH = 6;
const CONTEXT_MENU_CLASS = 'context-menu';
const CONTEXT_MENU_ITEM_CLASS = 'context-menu__item';

interface WindowInfo {
  title: string;
  order: number;
}

interface WindowResponse {
  key: string;
}

interface ContextMenuItem {
  text: string;
  handler: ({
    menuPosition,
  }: {
    menuPosition: { x: number; y: number };
  }) => unknown;
}

export class WindowManager {
  private _managerNode: HTMLElement;
  private _desktopNode: HTMLElement;
  private _contextNode: HTMLElement;
  private _windowMap: Record<string, WindowInfo>;
  private _focusKey: string | null;
  private _isContextOpen: boolean;
  private _desktopContextItems: ContextMenuItem[];

  public constructor(managerNode: HTMLElement, desktopNode: HTMLElement) {
    this._managerNode = managerNode;
    this._desktopNode = desktopNode;
    this._contextNode = document.createElement('ul')!;
    this._windowMap = {};
    this._focusKey = null;
    this._isContextOpen = false;
    this._desktopContextItems = [];

    this._setupContextNode();
    let timeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(this._shiftOutOfBoundsWindows, 150);
    });
    window.addEventListener('mousedown', (e) => {
      if (
        (e.target as HTMLElement).classList.contains(CONTEXT_MENU_CLASS) ||
        (e.target as HTMLElement).classList.contains(CONTEXT_MENU_ITEM_CLASS)
      ) {
        return;
      }
      this.closeContextMenu();
    });
    this._desktopNode.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.openContextMenu(this._desktopContextItems, e.clientX, e.clientY);
    });
    this._desktopNode.addEventListener('mousedown', () => {
      this._focusWindow(null);
    });
    this._initializeEventListeners();
  }

  public createWindow = (
    title: string,
    children: HTMLElement[] | null = null,
    position: { x: number; y: number } = { x: 0, y: 0 }
  ): WindowResponse => {
    let key = this._generateWindowKey();
    while (this._windowMap[key]) {
      key = this._generateWindowKey();
    }
    const newOrder = Object.values(this._windowMap).length
      ? Object.values(this._windowMap).sort((a, b) => b.order - a.order)[0]
          .order + 1
      : 0;
    const windowInfo: WindowInfo = {
      title,
      order: newOrder,
    };
    const windowNode = _createWindowNode(
      windowInfo,
      children,
      { x: position?.x ?? 0, y: position?.y ?? 0 },
      key,
      this.closeWindow,
      this.focusWindow,
      (key, mouseX, mouseY) =>
        this.openContextMenu(
          [{ text: 'Close', handler: () => this.closeWindow(key) }],
          mouseX,
          mouseY
        ),
      () => !this._isContextOpen
    );
    this._managerNode.appendChild(windowNode);
    this._windowMap[key] = windowInfo;
    this._shiftOutOfBoundsWindow(key);
    this.focusWindow(key);
    return { key };
  };

  public closeWindow = (key: string) => {
    if (!this._windowMap[key]) return;
    this._managerNode.querySelector(`[data-key="${key}"]`)?.remove();
    const deletedOrder = this._windowMap[key].order;
    Object.keys(this._windowMap).forEach((key) => {
      if (this._windowMap[key].order > deletedOrder) {
        this._windowMap[key].order--;
      }
    });
    delete this._windowMap[key];
  };

  public focusWindow = (key: string) => {
    if (!this._windowMap[key] || this._focusKey === key) return;
    this._managerNode.dispatchEvent(getOsFocusEvent(key));
  };

  public openContextMenu = (
    items: ContextMenuItem[],
    mouseX: number,
    mouseY: number
  ): void => {
    this.closeContextMenu();
    if (!items.length) return;
    items.forEach((item) => {
      const node = document.createElement('li')!;
      node.innerHTML = item.text;
      node.classList.add(CONTEXT_MENU_ITEM_CLASS);
      this._contextNode.appendChild(node);
    });
    this._isContextOpen = true;
    this._contextNode.classList.add(`${CONTEXT_MENU_CLASS}--shown`);

    const menuX =
      mouseX + this._contextNode.offsetWidth > window.innerWidth
        ? mouseX - this._contextNode.offsetWidth
        : mouseX;
    const menuY =
      mouseY + this._contextNode.offsetHeight > window.innerHeight
        ? mouseY - this._contextNode.offsetHeight
        : mouseY;

    ([...this._contextNode.children] as HTMLElement[]).forEach(
      (node, index) => {
        node.onclick = () => {
          items[index].handler({ menuPosition: { x: menuX, y: menuY } });
          this.closeContextMenu();
        };
      }
    );

    this._contextNode.style.translate = `${menuX}px ${menuY}px`;
  };

  public setDesktopContextMenu = (items: ContextMenuItem[]): void => {
    this._desktopContextItems = items;
  };

  public closeContextMenu = (): void => {
    if (!this._isContextOpen) return;
    this._contextNode.innerHTML = '';
    this._contextNode.classList.remove(`${CONTEXT_MENU_CLASS}--shown`);
    this._isContextOpen = false;
  };

  private _setupContextNode = (): void => {
    this._contextNode.classList.add(CONTEXT_MENU_CLASS);
    this._desktopNode.appendChild(this._contextNode);
  };

  private _generateWindowKey = (): string => {
    let result = '';
    for (let i = 0; i < WINDOW_KEY_LENGTH; i++) {
      result +=
        KEY_CHARACTERS[Math.floor(Math.random() * KEY_CHARACTERS.length)];
    }
    return result;
  };

  private _focusWindow = (key: string | null) => {
    if (key === null) {
      (
        [...this._managerNode.querySelectorAll('[data-key]')] as HTMLElement[]
      ).forEach((osWindow) => {
        osWindow.classList['remove'](WINDOW_FOCUSED_CLASS);
      });
      return;
    }
    const originalOrder = this._windowMap[key].order;
    const maxOrder = Object.values(this._windowMap).sort(
      (a, b) => b.order - a.order
    )[0].order;
    Object.keys(this._windowMap).forEach((key) => {
      if (this._windowMap[key].order > originalOrder) {
        this._windowMap[key].order--;
      }
    });
    this._windowMap[key].order = maxOrder;
    (
      [...this._managerNode.querySelectorAll('[data-key]')] as HTMLElement[]
    ).forEach((osWindow) => {
      const osWindowKey = osWindow.dataset.key!;
      osWindow.style.zIndex = this._windowMap[osWindowKey].order.toString();
      osWindow.classList[key === osWindowKey ? 'add' : 'remove'](
        WINDOW_FOCUSED_CLASS
      );
    });
  };

  private _shiftOutOfBoundsWindows = (): void => {
    (
      [...this._managerNode.querySelectorAll('[data-key]')] as HTMLElement[]
    ).forEach((osWindow) => {
      const boundingRect = osWindow.getBoundingClientRect();
      let usedLeft = boundingRect.left;
      let usedTop = boundingRect.top;
      if (boundingRect.left > window.innerWidth - osWindow.offsetWidth) {
        usedLeft = window.innerWidth - osWindow.offsetWidth;
      } else if (boundingRect.left < 0) {
        usedLeft = 0;
      }
      if (boundingRect.top > window.innerHeight - osWindow.offsetHeight) {
        usedTop = window.innerHeight - osWindow.offsetHeight;
      } else if (boundingRect.top < 0) {
        usedTop = 0;
      }
      osWindow.style.translate = `${usedLeft}px ${usedTop}px`;
    });
  };

  private _shiftOutOfBoundsWindow = (key: string): void => {
    if (!this._windowMap[key]) return;
    const node = this._managerNode.querySelector(
      `[data-key="${key}"]`
    ) as HTMLElement;
    const boundingRect = node.getBoundingClientRect();
    let usedLeft = boundingRect.left;
    let usedTop = boundingRect.top;
    if (boundingRect.left > window.innerWidth - node.offsetWidth) {
      usedLeft = window.innerWidth - node.offsetWidth;
    } else if (boundingRect.left < 0) {
      usedLeft = 0;
    }
    if (boundingRect.top > window.innerHeight - node.offsetHeight) {
      usedTop = window.innerHeight - node.offsetHeight;
    } else if (boundingRect.top < 0) {
      usedTop = 0;
    }
    node.style.translate = `${usedLeft}px ${usedTop}px`;
  };

  private _initializeEventListeners = (): void => {
    this._managerNode.addEventListener(OsEventType.FOCUS, (e: Event) => {
      const key = (e as CustomEvent).detail.key;
      this._focusWindow(key);
    });
  };
}

const _createWindowNode = (
  { title, order }: WindowInfo,
  children: HTMLElement[] | null,
  position: { x: number; y: number },
  key: string,
  closeHandler: (key: string) => void,
  focusHandler: (key: string) => void,
  contextHandler: (key: string, mouseX: number, mouseY: number) => void,
  movementPredicate: () => boolean
): HTMLElement => {
  const node = document.createElement('div')!;
  const titleNode = document.createElement('p')!;
  const titleIconNode = document.createElement('span')!;
  const titleTextNode = document.createElement('span')!;
  const titleButtonsNode = document.createElement('div')!;
  const closeButtonNode = document.createElement('button')!;
  const closeIconNode = createIcon('x-lg');
  const contentNode = document.createElement('div'!);

  node.classList.add(WINDOW_CLASS);
  titleNode.classList.add(WINDOW_TITLE_CLASS);
  titleIconNode.classList.add(WINDOW_TITLE_ICON_CLASS);
  titleTextNode.classList.add(WINDOW_TITLE_TEXT_CLASS);
  titleButtonsNode.classList.add(WINDOW_TITLE_BUTTONS_CLASS);
  closeButtonNode.classList.add(WINDOW_TITLE_BUTTON_CLASS);
  contentNode.classList.add(WINDOW_CONTENT_CLASS);

  titleIconNode.appendChild(createIcon('window'));
  titleTextNode.innerHTML = title;
  closeButtonNode.appendChild(closeIconNode);
  titleButtonsNode.appendChild(closeButtonNode);
  titleNode.appendChild(titleIconNode);
  titleNode.appendChild(titleTextNode);
  titleNode.appendChild(titleButtonsNode);

  if (children) {
    children.forEach((child) => {
      contentNode.appendChild(child);
    });
  }

  titleNode.addEventListener('mousedown', (e) => {
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const boundingRect = node.getBoundingClientRect();
    const baseX = e.clientX - boundingRect.left;
    const baseY = e.clientY - boundingRect.top;

    const onMouseMove = (e: MouseEvent) => {
      if (!movementPredicate()) return;
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
      node.style.translate = `${usedLeft}px ${usedTop}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  node.addEventListener('mousedown', () => focusHandler(key));
  node.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextHandler(key, e.clientX, e.clientY);
  });
  closeButtonNode.addEventListener('mousedown', () => closeHandler(key));

  node.appendChild(titleNode);
  if (children !== null) {
    node.appendChild(contentNode);
  }
  node.style.translate = `${position.x}px ${position.y}px`;
  node.style.zIndex = order.toString();
  node.dataset.key = key;
  return node;
};
