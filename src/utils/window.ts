import { windowManagerEl } from '../main';

export const createWindow = (title: string): void => {
  const windowNode = document.createElement('div')!;
  const titleNode = document.createElement('p')!;

  windowNode.classList.add('window');
  titleNode.innerHTML = title;
  windowNode.appendChild(titleNode);
  windowManagerEl.appendChild(windowNode);
};
