
import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';

import { pg } from '../database';
import { generateTokenParts, parseToken } from '../crypto';

const router = new Hono();

const required: {
	[ key: string ]: string;
} = {
	serial: 'string',
	password: 'string',
};

router.post('/login', async (c) =>
{
	try {
		const data = await c.req.json() as { [ key: string ]: string, serial: string, password: string };

		for (const key in required) {
			const type = typeof data[key];
			const reqType = required[key];

			if (type !== reqType) {
				return c.json({
					code: -1,
					error: `Expected '${key}' of type '${reqType}', but got '${type}'.`,
				});

			// @ts-ignore The type is alredy being checked
			} else if (data[key].length === 0) {
				return c.json({
					code: -2,
					error: `The content of '${key}' is missing.`,
				});
			}
		}

		const adminData = (await pg<{ password: string }[]>`SELECT password FROM users WHERE id = ${data.serial}`)[0];

		if (!adminData) {
			return c.json({
				code: 1,
				error: `La cédula o la contraseña son incorrectas.`,
			});
		}

		if (!(await Bun.password.verify(data.password, adminData.password))) {
			return c.json({
				code: 1,
				error: `La cédula o la contraseña son incorrectas.`,
			});
		}

		const parts = generateTokenParts();

		await pg`INSERT INTO auth_tokens (id, hmac_hash, user_id, expires_at) VALUES (
				${parts.id},
				${parts.hash},
				${data.serial},
				CURRENT_TIMESTAMP + '2 HOURS'
			)`;

		setCookie(c, 'auth_token', parts.token);

		return c.json({ code: 0 });

	} catch (error) {
		console.error(error);

		return c.json({
			code: -3,
			error: `Algo salió mal, intenta de nuevo más tarde.`,
		});
	}
});

router.delete('/logout', async (c) =>
{
	const cookie = getCookie(c, 'auth_token');

	if (cookie) {
		const parts = parseToken(cookie);
		deleteCookie(c, 'auth_token');

		await pg`DELETE FROM auth_tokens WHERE id = ${parts[0]}`;
	}

	return c.json({ code: 0 });
});
