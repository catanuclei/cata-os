import { windowManagerEl } from '../main';

import { createIcon } from './icon';

export const createWindow = (title: string): void => {
  const windowNode = document.createElement('div')!;
  const titleNode = document.createElement('p')!;

  windowNode.classList.add('window');
  titleNode.innerHTML = title;
  titleNode.appendChild(createIcon('vr'));
  windowNode.appendChild(titleNode);
  windowManagerEl.appendChild(windowNode);
};
