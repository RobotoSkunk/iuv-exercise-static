
import { Hono } from 'hono';
import { pg } from '../database';
import { sql } from 'bun';

const router = new Hono();

router.get('/', async (c) =>
{
	const teachers = await pg<{
		id: string;
		name: string;
		lastname_father: string;
		lastname_mother: string;
	}[]>`SELECT
			id,
			name,
			lastname_father,
			lastname_mother
		FROM
			teachers`;

	return c.json({
		code: 0,
		data: teachers.map(v => ({
			serial: v.id,
			name: v.name,
			lastname_father: v.lastname_father,
			lastname_mother: v.lastname_mother,
		})),
	});
});

router.get('/:serial', async (c) =>
{
	const { serial } = c.req.param();

	const teacher = (await pg<{
		id: string;
		name: string;
		lastname_father: string;
		lastname_mother: string;
	}[]>`SELECT
			id,
			name,
			lastname_father,
			lastname_mother
		FROM
			teachers
		WHERE
			id = ${serial}`
	)[0];

	if (!teacher) {
		return c.json({
			code: -1,
			message: 'No se encontró al docente solicitado.',
		});
	}

	return c.json({
		code: 0,
		data: {
			serial: teacher.id,
			name: teacher.name,
			lastname_father: teacher.lastname_father,
			lastname_mother: teacher.lastname_mother,
		},
	});
});

router.delete('/:serial', async (c) =>
{
	const { serial } = c.req.param();

	await pg`DELETE FROM teachers WHERE id = ${serial}`;

	return c.json({ code: 0 });
});

{
	const required: {
		[ key: string ]: string;
	} = {
		name: 'string',
		lastname_father: 'string',
		lastname_mother: 'string',
	};

	router.patch('/:serial', async (c) =>
	{
		const { serial } = c.req.param();

		try {
			const data = await c.req.json() as Partial<{
				name: string;
				lastname_father: string;
				lastname_mother: string;
			}> & { [ key: string ]: string | undefined };

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
				}
			}

			try {
				await pg`UPDATE teachers SET ${sql(data)} WHERE id = ${serial}`;
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
	};

	router.post('/', async (c) =>
	{
		try {
			const data = await c.req.json() as {
				serial: string;
				name: string;
				lastname_father: string;
				lastname_mother: string;
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
				}
			}

			{
				const count = (await pg<{count: number}[]>`SELECT COUNT(*) FROM teachers WHERE id = ${data.serial}`)[0]!.count;

				if (count > 0) {
					return c.json({
						code: -3,
						error: `La cédula solicitada ya se encuentra registrada.`,
					});
				}
			}

			try {
				await pg<{
					id: string;
					name: string;
					lastname_father: string;
					lastname_mother: string;
					role_id: number;
					role: string;
				}[]>`INSERT INTO teachers (id, name, lastname_father, lastname_mother) VALUES (
						${data.serial},
						${data.name},
						${data.lastname_father},
						${data.lastname_mother}
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
