import util from 'util';

export function setupTextDecoderAndTextEncoder() {
  // @ts-ignore
  global.TextDecoder = util.TextDecoder;
  global.TextEncoder = util.TextEncoder;
}
