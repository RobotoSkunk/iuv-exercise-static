
import crypto from 'crypto';

const algo = 'sha256';

function parseToken(token: string)
{
	const parts = token.split('.').filter(s => s.length > 0);

	if (parts.length != 2) {
		return [ '', '' ];
	}

	return parts;
}

function generateTokenParts()
{
	const bytes = crypto.randomBytes(48);
	const hash = crypto.hash(algo, bytes);

	const idBytes = crypto.randomBytes(24);

	const id = idBytes.toString('base64url');
	const key = bytes.toString('base64url');

	return {
		id,
		hash,
		token: `${id}.${key}`,
	};
}

function verifyHash(key: string, hash: string)
{
	try {
		const bytes = Buffer.from(key, 'base64url');
		const keyHash = crypto.hash(algo, bytes);

		return safeCompare(keyHash, hash);
	} catch (_) {
		return false;
	}
}

function safeCompare(a: string, b: string)
{
	const lenA = Buffer.byteLength(a);
	const lenB = Buffer.byteLength(b);

	const bufferA = Buffer.allocUnsafe(lenA);
	bufferA.write(a);

	const bufferB = Buffer.allocUnsafe(lenB);
	bufferB.write(b);

	return lenA == lenB && crypto.timingSafeEqual(bufferA, bufferB);
}

export {
	parseToken,
	generateTokenParts,
	verifyHash,
};
