
const permissionsData = [
	{
		intent: 'admin.create',
		name: 'Crear administradores',
	},
	{
		intent: 'admin.edit',
		name: 'Editar administradores',
	},
	{
		intent: 'admin.delete',
		name: 'Eliminar administradores',
	},
	{
		intent: 'role.create',
		name: 'Crear roles',
	},
	{
		intent: 'role.edit',
		name: 'Editar roles',
	},
	{
		intent: 'role.delete',
		name: 'Eliminar roles',
	},
	{
		intent: 'teacher.create',
		name: 'Registrar personal docente',
	},
	{
		intent: 'teacher.edit',
		name: 'Editar personal docente',
	},
	{
		intent: 'teacher.delete',
		name: 'Eliminar personal docente del sistema',
	},
];

(async () =>
{
	const result = await fetch('/api/roles.json');
	const params = new URLSearchParams(location.search);

	/**
	 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
	 */
	const json = await result.json();
	json.data.reverse();

	/**
	 * @type {HTMLTemplateElement}
	 */
	const template = document.getElementById('role-button');

	/**
	 * @type {{ id: number, name: string, permissions: string[] } | null}
	 */
	let currentRole = null; 

	for (const role of json.data) {
		const clone = document.importNode(template.content, true);

		const button = clone.querySelector('a');
		button.href	= `/rol.html?id=${role.id}`;
		button.id = `role-${role.id}`;

		const span = clone.querySelector('span');
		span.innerText = role.name;

		if (params.get('id') != role.id) {
			const img = clone.querySelector('img');
			img.remove();
		} else {
			currentRole = role;
		}

		document.getElementById('roles-list').prepend(button);
	}


	// Load panel content
	const roleId = params.get('id');

	if (!roleId || (roleId !== 'nuevo' && !currentRole)) {
		return;
	}

	/**
	 * @type {HTMLTemplateElement}
	 */
	const checkboxTemplate = document.getElementById('checkbox');

	if (currentRole) {
		document.getElementById('role-name').value = currentRole.name;

		if (currentRole.id === 1) {
			document.getElementById('section-noallowed').style.display = 'block';
		} else {
			document.getElementById('section-edit').style.display = 'flex';
		}

		document.getElementById('role-delete').addEventListener('click', (ev) =>
		{
			ev.preventDefault();

			const answer = confirm(
				'¿Estás seguro de eliminar este rol? Esto eliminará a todos los administradores ' +
				'adjuntos a este.'
			);

			if (!answer) {
				return;
			}

			Notifications.push('success', 'Se ha eliminado el rol solicitado.');
			document.getElementById(`role-${currentRole.id}`).remove();
			document.getElementById('role-data').remove();

			document.getElementById('alert').style.display = 'flex';

			setTimeout(() =>
			{
				Notifications.push('alert', 'La página se reiniciará en 5 segundos, ya que ésta es una simulación.');

				setTimeout(() =>
				{
					location.reload();
				}, 5500);
			}, 1000);
		});
	} else if (roleId === 'nuevo') {
		document.getElementById('section-create').style.display = 'block';
	}

	for (const permission of permissionsData) {
		const clone = document.importNode(checkboxTemplate.content, true);
		clone.querySelector('span').innerText = permission.name;

		const input = clone.querySelector('input');
		input.name = permission.intent;

		if (currentRole) {
			if (currentRole.permissions.includes(permission.intent)) {
				input.checked = true;
			}

			if (currentRole.id == 1) {
				input.disabled = true;
			}
		}

		document.getElementById('permissions').append(clone);
	}

	document.getElementById('alert').style.display = 'none';
	document.getElementById('role-data').style.display = 'block';
})();
