export const createIcon = (name: string): HTMLSpanElement => {
  const element = document.createElement('span')!;
  element.classList.add('bi', `bi-${name}`);
  return element;
};
