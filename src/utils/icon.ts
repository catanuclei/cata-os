export const createIcon = (
  name: string,
  className: string = ''
): HTMLSpanElement => {
  const element = document.createElement('span')!;
  if (className) {
    element.classList.add(className);
  }
  element.classList.add('bi', `bi-${name}`);
  return element;
};
