
import { Hono } from 'hono';
import { pg } from '../database';

const router = new Hono();

router.get('/', async (c) =>
{
	const roles = await pg<{
		id: string;
		name: string;
		permissions: string[];
	}[]>`SELECT
			id,
			name,
			permissions
		FROM
			roles`;

	return c.json({
		code: 0,
		data: roles,
	});
});

router.get('/:id', async (c) =>
{
	const { id } = c.req.param();

	const role = await pg<{
		id: string;
		name: string;
		permissions: string[];
	}[]>`SELECT
			id,
			name,
			permissions
		FROM
			roles
		WHERE
			id = ${id}`;

	if (!role) {
		return c.json({
			code: -1,
			message: 'No se encontró el rol solicitado.',
		});
	}

	return c.json({
		code: 0,
		data: role,
	});
});

router.delete('/:id', async (c) =>
{
	const { id } = c.req.param();

	await pg`DELETE FROM roles WHERE id = ${id}`;

	return c.json({ code: 0 });
});

{
	const required: {
		[ key: string ]: string;
	} = {
		name: 'string',
		permissions: 'object',
	};

	router.patch('/:id', async (c) =>
	{
		const { id } = c.req.param();

		try {
			const data = await c.req.json() as Partial<{
				name: string;
				permissions: string[];
			}> & { [ key: string ]: string | object | undefined };

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

				} else if (type === 'object') {
					if (Array.isArray(data[key])) {
						for (const value of data[key]) {
							const valueType = typeof value;

							if (valueType !== 'string') {
								return c.json({
									code: -4,
									error: `Expected values of '${key}' of type 'string', but got '${valueType}'.`,
								});
							}
						}
					} else {
						return c.json({
							code: -5,
							error: `Expected '${key}' of type 'string[]', but got '${type}'.`,
						});
					}
				}
			}

			if (data.permissions && data.permissions.length === 0) {
				return c.json({
					code: -6,
					error: `Debe haber al menos un permiso seleccionado.`,
				});
			}

			const columns: string[] = [];

			if (data.name) {
				columns.push('name');
			}
			if (data.permissions) {
				columns.push('permissions');
			}

			const values: (string|string[])[] = [];

			if (data.name) {
				values.push(data.name);
			}
			if (data.permissions) {
				values.push(data.permissions);
			}

			try {
				await pg`UPDATE roles(${columns.join(',')}) SET (${values.join(',')}) WHERE id = ${id}`;
			} catch (e) {
				console.error(e);

				return c.json({
					code: -7,
					error: `Algo salió mal, intenta de nuevo más tarde.`,
				});
			}

			return c.json({
				code: 0,
			});
		} catch (error) {
			console.error(error);

			return c.json({
				code: -8,
				error: `Algo salió mal, intenta de nuevo más tarde.`,
			});
		}
	});
}

{
	const required: {
		[ key: string ]: string;
	} = {
		name: 'string',
		permissions: 'object',
	};

	router.post('/', async (c) =>
	{
		try {
			const data = await c.req.json() as {
				name: string;
				permissions: string[];
			} & { [ key: string ]: string | object };

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

				} else if (type === 'object') {
					if (Array.isArray(data[key])) {
						for (const value of data[key]) {
							const valueType = typeof value;

							if (valueType !== 'string') {
								return c.json({
									code: -4,
									error: `Expected values of '${key}' of type 'string', but got '${valueType}'.`,
								});
							}
						}
					} else {
						return c.json({
							code: -5,
							error: `Expected '${key}' of type 'string[]', but got '${type}'.`,
						});
					}
				}
			}

			if (data.permissions.length === 0) {
				return c.json({
					code: -6,
					error: `Debe haber al menos un permiso seleccionado.`,
				});
			}

			try {
				await pg`INSERT INTO roles(name, permissions) VALUES (${data.name}, ${data.permissions})`;
			} catch (e) {
				console.error(e);

				return c.json({
					code: -7,
					error: `Algo salió mal, intenta de nuevo más tarde.`,
				});
			}

			return c.json({
				code: 0,
			});
		} catch (error) {
			console.error(error);

			return c.json({
				code: -8,
				error: `Algo salió mal, intenta de nuevo más tarde.`,
			});
		}
	});
}


export default router;
