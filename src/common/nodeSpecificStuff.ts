import util from 'util';

export function setupTextDecoderAndTextEncoder() {
	// @ts-expect-error
	global.TextDecoder = util.TextDecoder;
	global.TextEncoder = util.TextEncoder;
}
