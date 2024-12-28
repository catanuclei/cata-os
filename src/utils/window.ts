import { createIcon } from './icon';

import {
  OsEventType,
  getOsFocusEvent,
  getOsMaximizeEvent,
  getOsUnmaximizeEvent,
} from './event';
import { KEY_CHARACTERS } from './constants';

const WINDOW_CLASS = 'window';
const WINDOW_FOCUSED_CLASS = 'window--focused';
const WINDOW_TITLE_CLASS = 'window__title';
const WINDOW_TITLE_ICON_CLASS = 'window__title__icon';
const WINDOW_TITLE_TEXT_CLASS = 'window__title__text';
const WINDOW_TITLE_BUTTONS_CLASS = 'window__title__buttons';
const WINDOW_TITLE_BUTTON_CLASS = 'window__title__button';
const WINDOW_TITLE_MAXIMIZE_CLASS = 'window__title__maximize';
const WINDOW_TITLE_CLOSE_CLASS = 'window__title__close';
const WINDOW_CONTENT_CLASS = 'window__content';
const WINDOW_RESIZE_BOX_CLASS = 'window__resize-box';
const WINDOW_RESIZE_BOX_TOP_CLASS = 'window__resize-box--top';
const WINDOW_RESIZE_BOX_RIGHT_CLASS = 'window__resize-box--right';
const WINDOW_RESIZE_BOX_BOTTOM_CLASS = 'window__resize-box--bottom';
const WINDOW_RESIZE_BOX_LEFT_CLASS = 'window__resize-box--left';
const WINDOW_RESIZE_BOX_TOP_LEFT_CLASS = 'window__resize-box--top-left';
const WINDOW_RESIZE_BOX_TOP_RIGHT_CLASS = 'window__resize-box--top-right';
const WINDOW_RESIZE_BOX_BOTTOM_LEFT_CLASS = 'window__resize-box--bottom-left';
const WINDOW_RESIZE_BOX_BOTTOM_RIGHT_CLASS = 'window__resize-box--bottom-right';
const WINDOW_KEY_LENGTH = 6;
const CONTEXT_MENU_CLASS = 'context-menu';
const CONTEXT_MENU_ITEM_CLASS = 'context-menu__item';

interface WindowInfo {
  title: string;
  icon: string | null;
  minDimensions: { width: number; height: number };
  order: number;
  _premaximizeRect: DOMRect | null;
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
      timeout = setTimeout(this._shiftAndScaleOutOfBoundsWindows, 150);
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
    icon: string | null,
    children: HTMLElement[] | null = null,
    position: { x: number; y: number } = { x: 0, y: 0 },
    minDimensions: { width: number; height: number } = { width: 96, height: 72 }
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
      icon,
      minDimensions,
      order: newOrder,
      _premaximizeRect: null,
    };
    const windowNode = _createWindowNode(
      windowInfo,
      children,
      { x: position?.x ?? 0, y: position?.y ?? 0 },
      key,
      this.maximizeWindow,
      this.closeWindow,
      this.focusWindow,
      (key, mouseX, mouseY) =>
        this.openContextMenu(
          [{ text: 'Close', handler: () => this.closeWindow(key) }],
          mouseX,
          mouseY
        ),
      () => !this._isContextOpen,
      () => !!this._windowMap[key]?._premaximizeRect
    );
    this._managerNode.appendChild(windowNode);
    this._windowMap[key] = windowInfo;
    this._shiftAndScaleOutOfBoundsWindow(key);
    this.focusWindow(key);
    return { key };
  };

  public maximizeWindow = (key: string, shift: boolean = true) => {
    if (!this._windowMap[key]) return;
    if (!this._windowMap[key]._premaximizeRect) {
      this._managerNode.dispatchEvent(getOsFocusEvent(key));
      this._managerNode.dispatchEvent(getOsMaximizeEvent(key));
      return;
    }
    this._managerNode.dispatchEvent(getOsUnmaximizeEvent(key, shift));
  };

  public unmaximizeWindow = (key: string, shift: boolean = true) => {
    if (!this._windowMap[key]) return;
    this._managerNode.dispatchEvent(getOsUnmaximizeEvent(key, shift));
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

  private _maximizeWindow = (key: string) => {
    const node = this._managerNode.querySelector(
      `[data-key="${key}"]`
    ) as HTMLElement;
    this._windowMap[key]._premaximizeRect = node.getBoundingClientRect();
    node.style.translate = '0px 0px';
    node.style.width = `${window.innerWidth}px`;
    node.style.height = `${window.innerHeight}px`;
    const maximizeIcon = node.querySelector(`.${WINDOW_TITLE_MAXIMIZE_CLASS}`)!;
    maximizeIcon.classList.remove('bi-arrows-angle-expand');
    maximizeIcon.classList.add('bi-arrows-angle-contract');
  };

  private _unmaximizeWindow = (key: string, shift: boolean = true) => {
    const premaximizeRect = this._windowMap[key]._premaximizeRect;
    if (!premaximizeRect) {
      return;
    }
    const node = this._managerNode.querySelector(
      `[data-key="${key}"]`
    ) as HTMLElement;
    if (shift) {
      node.style.translate = `${premaximizeRect.left}px ${premaximizeRect.top}px`;
      node.style.width = `${premaximizeRect.width}px`;
      node.style.height = `${premaximizeRect.height}px`;
    }
    const maximizeIcon = node.querySelector(`.${WINDOW_TITLE_MAXIMIZE_CLASS}`)!;
    maximizeIcon.classList.remove('bi-arrows-angle-contract');
    maximizeIcon.classList.add('bi-arrows-angle-expand');
    this._windowMap[key]._premaximizeRect = null;
    this._shiftAndScaleOutOfBoundsWindow(key);
  };

  private _shiftAndScaleOutOfBoundsWindows = (): void => {
    (
      [...this._managerNode.querySelectorAll('[data-key]')] as HTMLElement[]
    ).forEach((osWindow) => {
      const key = osWindow.dataset.key!;
      const boundingRect = osWindow.getBoundingClientRect();
      const premaximizeRect = this._windowMap[key]._premaximizeRect;
      let usedLeft = boundingRect.left;
      let usedTop = boundingRect.top;
      if (boundingRect.width > window.innerWidth) {
        osWindow.style.width = `${window.innerWidth}px`;
      }
      if (boundingRect.height > window.innerHeight) {
        osWindow.style.height = `${window.innerHeight}px`;
      }
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
      const currentRect = osWindow.getBoundingClientRect();
      if (
        premaximizeRect &&
        (window.innerWidth > currentRect.width ||
          window.innerHeight > currentRect.height)
      ) {
        this._unmaximizeWindow(key, false);
      }
      osWindow.style.translate = `${usedLeft}px ${usedTop}px`;
    });
  };

  private _shiftAndScaleOutOfBoundsWindow = (key: string): void => {
    if (!this._windowMap[key]) return;
    const node = this._managerNode.querySelector(
      `[data-key="${key}"]`
    ) as HTMLElement;
    const boundingRect = node.getBoundingClientRect();
    const premaximizeRect = this._windowMap[key]._premaximizeRect;
    let usedLeft = boundingRect.left;
    let usedTop = boundingRect.top;
    if (boundingRect.width > window.innerWidth) {
      node.style.width = `${window.innerWidth}px`;
    }
    if (boundingRect.height > window.innerHeight) {
      node.style.height = `${window.innerHeight}px`;
    }
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
    const currentRect = node.getBoundingClientRect();
    if (
      premaximizeRect &&
      (window.innerWidth > currentRect.width ||
        window.innerHeight > currentRect.height)
    ) {
      this._unmaximizeWindow(key, false);
    }
    node.style.translate = `${usedLeft}px ${usedTop}px`;
  };

  private _initializeEventListeners = (): void => {
    this._managerNode.addEventListener(OsEventType.FOCUS, (e: Event) => {
      const key = (e as CustomEvent).detail.key;
      this._focusWindow(key);
    });
    this._managerNode.addEventListener(OsEventType.MAXIMIZE, (e: Event) => {
      const key = (e as CustomEvent).detail.key;
      this._maximizeWindow(key);
    });
    this._managerNode.addEventListener(OsEventType.UNMAXIMIZE, (e: Event) => {
      const key = (e as CustomEvent).detail.key;
      const shift = (e as CustomEvent).detail.shift;
      this._unmaximizeWindow(key, shift ?? true);
    });
  };
}

const _createWindowNode = (
  { title, icon, minDimensions, order }: WindowInfo,
  children: HTMLElement[] | null,
  position: { x: number; y: number },
  key: string,
  maximizeHandler: (key: string, shift: boolean) => void,
  closeHandler: (key: string) => void,
  focusHandler: (key: string) => void,
  contextHandler: (key: string, mouseX: number, mouseY: number) => void,
  movementPredicate: () => boolean,
  fullscreenPredicate: () => boolean
): HTMLElement => {
  const node = document.createElement('div')!;
  const titleNode = document.createElement('p')!;
  const titleIconNode = document.createElement('span')!;
  const titleTextNode = document.createElement('span')!;
  const titleButtonsNode = document.createElement('div')!;
  const maximizeButtonNode = document.createElement('button')!;
  const maximizeIconNode = createIcon(
    'arrows-angle-expand',
    WINDOW_TITLE_MAXIMIZE_CLASS
  );
  const closeButtonNode = document.createElement('button')!;
  const closeIconNode = createIcon('x-lg', WINDOW_TITLE_CLOSE_CLASS);
  const contentNode = document.createElement('div'!);

  // Resize Boxes
  const topResizeBoxNode = document.createElement('div')!;
  const rightResizeBoxNode = document.createElement('div')!;
  const bottomResizeBoxNode = document.createElement('div')!;
  const leftResizeBoxNode = document.createElement('div')!;
  const topLeftResizeBoxNode = document.createElement('div')!;
  const topRightResizeBoxNode = document.createElement('div')!;
  const bottomLeftResizeBoxNode = document.createElement('div')!;
  const bottomRightResizeBoxNode = document.createElement('div')!;

  topResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_TOP_CLASS
  );
  rightResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_RIGHT_CLASS
  );
  bottomResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_BOTTOM_CLASS
  );
  leftResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_LEFT_CLASS
  );
  topLeftResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_TOP_LEFT_CLASS
  );
  topRightResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_TOP_RIGHT_CLASS
  );
  bottomLeftResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_BOTTOM_LEFT_CLASS
  );
  bottomRightResizeBoxNode.classList.add(
    WINDOW_RESIZE_BOX_CLASS,
    WINDOW_RESIZE_BOX_BOTTOM_RIGHT_CLASS
  );

  node.classList.add(WINDOW_CLASS);
  titleNode.classList.add(WINDOW_TITLE_CLASS);
  titleIconNode.classList.add(WINDOW_TITLE_ICON_CLASS);
  titleTextNode.classList.add(WINDOW_TITLE_TEXT_CLASS);
  titleButtonsNode.classList.add(WINDOW_TITLE_BUTTONS_CLASS);
  maximizeButtonNode.classList.add(WINDOW_TITLE_BUTTON_CLASS);
  closeButtonNode.classList.add(WINDOW_TITLE_BUTTON_CLASS);
  contentNode.classList.add(WINDOW_CONTENT_CLASS);

  if (icon) {
    titleIconNode.appendChild(createIcon(icon));
  }

  titleTextNode.innerHTML = title;
  maximizeButtonNode.appendChild(maximizeIconNode);
  closeButtonNode.appendChild(closeIconNode);
  titleButtonsNode.appendChild(maximizeButtonNode);
  titleButtonsNode.appendChild(closeButtonNode);
  if (icon) {
    titleNode.appendChild(titleIconNode);
  }
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
  maximizeButtonNode.addEventListener('mousedown', () =>
    maximizeHandler(key, true)
  );
  closeButtonNode.addEventListener('mousedown', () => closeHandler(key));

  const onResize = (e: MouseEvent, axis: { x: number; y: number }) => {
    const boundingRect = node.getBoundingClientRect();
    const baseX = e.clientX;
    const baseY = e.clientY;
    const maxWidth = window.innerWidth - boundingRect.left;
    const maxHeight = window.innerHeight - boundingRect.top;
    const minWidth = minDimensions.width;
    const minHeight = minDimensions.height;
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      let usedX: number = boundingRect.left;
      let usedY: number = boundingRect.top;
      const isFullscreen = fullscreenPredicate();

      if (axis.x === 1) {
        let newWidth = boundingRect.width + e.clientX - baseX;
        if (newWidth >= minWidth) {
          if (newWidth >= maxWidth) {
            newWidth = maxWidth;
          }
        } else {
          newWidth = minWidth;
        }
        node.style.width = `${newWidth}px`;
        if (newWidth < boundingRect.width && isFullscreen) {
          maximizeHandler(key, false);
        }
      } else if (axis.x === -1) {
        let newWidth = boundingRect.width - (e.clientX - baseX);
        let newLeft = boundingRect.left;
        if (e.clientX >= 0) {
          if (boundingRect.right - e.clientX <= minWidth) {
            newWidth = minWidth;
            newLeft = boundingRect.right - minWidth;
          } else {
            newLeft = boundingRect.left + (e.clientX - baseX);
          }
        } else {
          newWidth = boundingRect.right;
          newLeft = 0;
        }
        if (newLeft < 0) newLeft = 0;
        node.style.width = `${newWidth}px`;
        usedX = newLeft;
        if (newWidth < boundingRect.width && isFullscreen) {
          maximizeHandler(key, false);
        }
      }
      if (axis.y === 1) {
        let newHeight = boundingRect.height + e.clientY - baseY;
        if (newHeight >= minHeight) {
          if (newHeight >= maxHeight) {
            newHeight = maxHeight;
          }
        } else {
          newHeight = minHeight;
        }
        node.style.height = `${newHeight}px`;
        if (newHeight < boundingRect.height && isFullscreen) {
          maximizeHandler(key, false);
        }
      } else if (axis.y === -1) {
        let newHeight = boundingRect.height - (e.clientY - baseY);
        let newTop = boundingRect.top;
        if (e.clientY >= 0) {
          if (boundingRect.bottom - e.clientY <= minHeight) {
            newHeight = minHeight;
            newTop = boundingRect.bottom - minHeight;
          } else {
            newTop = boundingRect.top + (e.clientY - baseY);
          }
        } else {
          newHeight = boundingRect.bottom;
          newTop = 0;
        }
        if (newTop < 0) newTop = 0;
        node.style.height = `${newHeight}px`;
        usedY = newTop;
        if (newHeight < boundingRect.height && isFullscreen) {
          maximizeHandler(key, false);
        }
      }
      node.style.translate = `${usedX}px ${usedY}px`;
    };

    const onMouseUp = () => {
      document.body.style.userSelect = 'unset';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  topResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: 0, y: -1 })
  );
  bottomResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: 0, y: 1 })
  );
  leftResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: -1, y: 0 })
  );
  rightResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: 1, y: 0 })
  );
  topLeftResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: -1, y: -1 })
  );
  topRightResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: 1, y: -1 })
  );
  bottomLeftResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: -1, y: 1 })
  );
  bottomRightResizeBoxNode.addEventListener('mousedown', (e) =>
    onResize(e, { x: 1, y: 1 })
  );

  node.appendChild(topResizeBoxNode);
  node.appendChild(rightResizeBoxNode);
  node.appendChild(bottomResizeBoxNode);
  node.appendChild(leftResizeBoxNode);
  node.appendChild(topLeftResizeBoxNode);
  node.appendChild(topRightResizeBoxNode);
  node.appendChild(bottomLeftResizeBoxNode);
  node.appendChild(bottomRightResizeBoxNode);

  node.appendChild(titleNode);
  if (children !== null) {
    node.appendChild(contentNode);
  }
  node.style.minWidth = `${minDimensions.width}px`;
  node.style.minHeight = `${minDimensions.height}px`;
  node.style.translate = `${position.x}px ${position.y}px`;
  node.style.zIndex = order.toString();
  node.dataset.key = key;
  return node;
};
