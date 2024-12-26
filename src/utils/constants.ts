export const OsConstants = {
  DISPLAY_NAME: 'CataOS',
  VERSION: '0.0.1',
  AUTHOR: 'catanuclei',
  COPYRIGHT_YEAR: '2024',
};

export const KEY_CHARACTERS = (() => {
  const characters: string[] = [];
  for (let i = 0; i < 10; i++) {
    characters.push(i.toString());
  }
  for (let i = 0; i < 26; i++) {
    characters.push(String.fromCharCode(97 + i));
  }
  for (let i = 0; i < 26; i++) {
    characters.push(String.fromCharCode(65 + i));
  }
  return characters;
})();
