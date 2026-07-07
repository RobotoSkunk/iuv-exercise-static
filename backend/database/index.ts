
import { SQL } from 'bun';

const ENV = {
	NAME: process.env.DB_NAME ?? '',
	HOST: process.env.DB_HOST ?? '',
	PASSWORD: process.env.DB_PASSWORD ?? '',
	PORT: process.env.DB_PORT ?? '',
	USER: process.env.DB_USER ?? '',
};

export const pg = new SQL(`postgres://${ENV.USER}:${encodeURIComponent(ENV.PASSWORD)}@${ENV.HOST}:${ENV.PORT}/${ENV.NAME}`);

export async function initDatabase()
{
	await pg`CREATE TABLE IF NOT EXISTS teachers (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		lastname_father TEXT NOT NULL,
		lastname_mother TEXT NOT NULL
	)`;

	await pg`CREATE TABLE IF NOT EXISTS roles (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		permissions TEXT[] NOT NULL
	)`;

	await pg`CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		lastname_father TEXT NOT NULL,
		lastname_mother TEXT NOT NULL,
		password TEXT NOT NULL,
		role_id INTEGER NOT NULL,

		FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
	)`;

	await pg`CREATE TABLE IF NOT EXISTS attendances (
		id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
		teacher_id TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		is_entry BOOLEAN NOT NULL,

		FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
	)`;

	await pg`CREATE TABLE IF NOT EXISTS auth_tokens (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		hmac_hash TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`;


	// Fill database
	const rolesCount = (await pg<{ count: number }[]>`SELECT COUNT(*) FROM roles`)[0]!.count;
	const teachersCount = (await pg<{ count: number }[]>`SELECT COUNT(*) FROM teachers`)[0]!.count;

	if (rolesCount == 0) {
		const password = await Bun.password.hash('1234');

		await pg`INSERT INTO roles(name, permissions) VALUES
		(
			'Administrador del sistema',
			'{
				"admin.create",
				"admin.edit",
				"admin.delete",
				"role.create",
				"role.edit",
				"role.delete",
				"teacher.create",
				"teacher.edit",
				"teacher.delete"
			}'
		),
		(
			'Empleado',
			'{
				"teacher.create",
				"teacher.edit",
				"teacher.delete"
			}'
		),
		(
			'Administrador de roles',
			'{
				"role.create",
				"role.edit",
				"role.delete"
			}'
		)`;

		await pg`INSERT INTO users(id, name, lastname_father, lastname_mother, password, role_id) VALUES
		(
			'ABC123',
			'José Ignacio',
			'Orozco',
			'Álvarez',
			${password},
			1
		),
		(
			'DEF789',
			'Adán',
			'Castro',
			'Reyes',
			${password},
			3
		),
		(
			'HIJ135',
			'Maricela',
			'Ortiz',
			'Valenzuela',
			${password},
			2
		),
		(
			'LEM246',
			'Leticia',
			'Pérez',
			'Ibarra',
			${password},
			2
		)`;
	}

	if (teachersCount == 0) {
		await pg`INSERT INTO teachers(id, name, lastname_father, lastname_mother) VALUES
		(
			'PIJ-032',
			'Profesor',
			'Inocencio',
			'Jirafales'
		),
		(
			'JCG-019',
			'Juanita',
			'Contreras',
			'Gutiérrez'
		),
		(
			'LCM-030',
			'Luis',
			'Campos',
			'Méndez'
		),
		(
			'MSB-103',
			'María Elena',
			'Solís',
			'Bautista'
		)`;
	}

	console.log('Initialized database');
}
