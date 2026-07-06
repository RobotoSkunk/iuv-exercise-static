
import { Hono } from 'hono';
import { pg } from '../database';
import crypto from 'crypto';
import { sql } from 'bun';

const router = new Hono();

router.get('/', async (c) =>
{
	const admins = await pg<{
		id: string;
		name: string;
		lastname_father: string;
		lastname_mother: string;
		role_id: number;
		role: string;
	}[]>`SELECT
			users.id,
			users.name,
			users.lastname_father,
			users.lastname_mother,
			roles.id as role_id,
			roles.name as role
		FROM
			users, roles
		WHERE
			roles.id = users.role_id`;

	return c.json({
		code: 0,
		data: admins.map(v => ({
			serial: v.id,
			name: v.name,
			lastname_father: v.lastname_father,
			lastname_mother: v.lastname_mother,
			role_id: v.role_id,
			role: v.role,
		})),
	});
});

router.get('/:serial', async (c) =>
{
	const { serial } = c.req.param();

	const admin = (await pg<{
		id: string;
		name: string;
		lastname_father: string;
		lastname_mother: string;
		role_id: number;
		role: string;
	}[]>`SELECT
			users.id,
			users.name,
			users.lastname_father,
			users.lastname_mother,
			roles.id as role_id,
			roles.name as role
		FROM
			users, roles
		WHERE
			roles.id = users.role_id AND users.id = ${serial}`
	)[0];

	if (!admin) {
		return c.json({
			code: -1,
			message: 'No se encontró al administrador solicitado.',
		});
	}

	return c.json({
		code: 0,
		data: {
			serial: admin.id,
			name: admin.name,
			lastname_father: admin.lastname_father,
			lastname_mother: admin.lastname_mother,
			role_id: admin.role_id,
			role: admin.role,
		},
	});
});

router.delete('/:serial', async (c) =>
{
	const { serial } = c.req.param();

	await pg`DELETE FROM users WHERE id = ${serial}`;

	return c.json({ code: 0 });
});

{
	const required: {
		[ key: string ]: string;
	} = {
		name: 'string',
		lastname_father: 'string',
		lastname_mother: 'string',
		role_id: 'number',
	};

	router.patch('/:serial', async (c) =>
	{
		const { serial } = c.req.param();

		try {
			const data = await c.req.json() as Partial<{
				name: string;
				lastname_father: string;
				lastname_mother: string;
				role_id: number;
			}> & { [ key: string ]: string | number | undefined };

			for (const key in required) {
				const type = typeof data[key];
				const reqType = required[key];

				if (type === 'undefined') {
					continue;
				}

				if (type !== reqType) {
					return c.json({
						code: -1,
						error: `Expected '${key}' of type '${reqType}', but got '${type}'.`,
					});

				// @ts-ignore The type is alredy being checked
				} else if (type === 'string' && data[key].length === 0) {
					return c.json({
						code: -2,
						error: `The content of '${key}' is missing.`,
					});

				// @ts-ignore The type is alredy being checked
				} else if (type === 'number' && data[key] < 0) {
					return c.json({
						code: -3,
						error: `The content of '${key}' is missing.`,
					});
				}
			}

			try {
				await pg`UPDATE users SET ${sql(data)} WHERE id = ${serial}`;
			} catch (e) {
				console.error(e);

				return c.json({
					code: -4,
					error: `Algo salió mal, intenta de nuevo más tarde.`,
				});
			}

			return c.json({
				code: 0,
			});
		} catch (error) {
			console.error(error);

			return c.json({
				code: -5,
				error: `Algo salió mal, intenta de nuevo más tarde.`,
			});
		}
	});
}

{
	const required: {
		[ key: string ]: string;
	} = {
		serial: 'string',
		name: 'string',
		lastname_father: 'string',
		lastname_mother: 'string',
		role_id: 'number',
	};

	router.post('/', async (c) =>
	{
		try {
			const data = await c.req.json() as {
				serial: string;
				name: string;
				lastname_father: string;
				lastname_mother: string;
				role_id: number;
			} & { [ key: string ]: string | number };

			for (const key in required) {
				const type = typeof data[key];
				const reqType = required[key];

				if (type !== reqType) {
					return c.json({
						code: -1,
						error: `Expected '${key}' of type '${reqType}', but got '${type}'.`,
					});

				// @ts-ignore The type is alredy being checked
				} else if (type === 'string' && data[key].length === 0) {
					return c.json({
						code: -2,
						error: `The content of '${key}' is missing.`,
					});

				// @ts-ignore The type is alredy being checked
				} else if (type === 'number' && data[key] < 0) {
					return c.json({
						code: -2,
						error: `The content of '${key}' is missing.`,
					});
				}
			}

			{
				const count = (await pg<{count: number}[]>`SELECT COUNT(*) FROM users WHERE id = ${data.serial}`)[0]!.count;

				if (count > 0) {
					return c.json({
						code: -3,
						error: `La cédula solicitada ya se encuentra registrada.`,
					});
				}
			}

			const newPassword = crypto
				.randomBytes(12)
				.toString('base64url');

			const hash = await Bun.password.hash(newPassword);

			try {
				await pg<{
					id: string;
					name: string;
					lastname_father: string;
					lastname_mother: string;
					role_id: number;
					role: string;
				}[]>`INSERT INTO users (id, name, lastname_father, lastname_mother, password, role_id) VALUES (
						${data.serial},
						${data.name},
						${data.lastname_father},
						${data.lastname_mother},
						${hash},
						${data.role_id}
					)`;
			} catch (e) {
				console.error(e);

				return c.json({
					code: -4,
					error: `Algo salió mal, intenta de nuevo más tarde.`,
				});
			}

			return c.json({
				code: 0,
				data: {
					password: newPassword,
				},
			});
		} catch (error) {
			console.error(error);

			return c.json({
				code: -5,
				error: `Algo salió mal, intenta de nuevo más tarde.`,
			});
		}
	})
}


export default router;
