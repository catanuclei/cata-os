import { createIcon } from './icon';

interface WindowInfo {
  key: string;
}
export class WindowManager {
  private _managerNode: HTMLElement;

  public constructor(managerNode: HTMLElement) {
    this._managerNode = managerNode;
  }

  public createWindow = (title: string): WindowInfo => {
    const key = 'key';
    const windowNode = document.createElement('div')!;
    const titleNode = document.createElement('p')!;

    windowNode.classList.add('window');
    titleNode.innerHTML = title;
    titleNode.appendChild(createIcon('vr'));
    windowNode.appendChild(titleNode);
    this._managerNode.appendChild(windowNode);

    return { key };
  };
}
