
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { pg } from '../database';
import { parseToken } from '../crypto';

const router = new Hono();

router.get('/', async (c) =>
{
	const token = getCookie(c, 'auth_token');

	if (!token) {
		return c.json({ code: 1 });
	}

	const [ id ] = parseToken(token);

	const user = (await pg<{
		id: string;
		name: string;
		lastname_father: string;
		lastname_mother: string;
		role_id: number;
		role_name: string;
		role_permission: string[];
	}[]>`SELECT
			users.id,
			users.name,
			users.lastname_father,
			users.lastname_mother,
			roles.id as role_id,
			roles.name as role_name,
			roles.permissions as role_permissions
		FROM
			users, roles, auth_tokens
		WHERE
			users.role_id = roles.id AND auth_tokens.user_id = users.id AND auth_tokens.id = ${id}
	`)[0]!;


	return c.json({
		code: 0,
		data: {
			serial: user.id,
			name: user.name,
			lastname_father: user.lastname_father,
			lastname_mother: user.lastname_mother,
			role: {
				id: user.role_id,
				name: user.role_name,
				permission: user.role_permission,
			},
		},
	});
});

export default router;
