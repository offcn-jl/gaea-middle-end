import { parse } from 'querystring';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

// base62 编码表
const base62 = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
];

// base62 编码
export const base62Encode = (num: number) => {
  let baseStr = '';
  let currentNum = num;
  while (currentNum > 0) {
    const i = currentNum % 62;
    baseStr += base62[i];
    currentNum = (currentNum - i) / 62;
  }
  return baseStr;
};

// base62 解码
export const base62Decode = (str: string) => {
  let num = 0;
  const base62Map = {};
  for (let index = 0, { length } = base62; index < length; index += 1) {
    base62Map[base62[index]] = index;
  }
  for (let index = 0, { length } = str; index < length; index += 1) {
    num += base62Map[str[index]] * 62 ** index;
  }
  return num;
};
