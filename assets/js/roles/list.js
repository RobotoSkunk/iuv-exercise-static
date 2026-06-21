
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
	const response = await fetch('/data/roles.json');
	const params = new URLSearchParams(location.search);

	/**
	 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
	 */
	const json = await response.json();
	json.data.reverse();

	const template = $('#role-button');

	/**
	 * @type {{ id: number, name: string, permissions: string[] } | null}
	 */
	let currentRole = null; 

	for (const role of json.data) {
		const clone = template.contents().clone(true);
		clone.attr('href', `/rol.html?id=${role.id}`);
		clone.attr('id', `role-${role.id}`);

		const span = clone.children('span');
		span.text(role.name);

		if (params.get('id') != role.id) {
			const img = clone.children('img');
			img.remove();
		} else {
			currentRole = role;
		}

		$('#roles-list').prepend(clone);
	}


	// Load panel content
	const roleId = params.get('id');

	if (!roleId || (roleId !== 'nuevo' && !currentRole)) {
		return;
	}

	const checkboxTemplate = $('#checkbox');

	if (currentRole) {
		$('#role-name').val(currentRole.name);

		if (currentRole.id === 1) {
			$('#section-noallowed').css('display', 'block');
		} else {
			$('#section-edit').css('display', 'flex');
		}

		$('#role-delete').on('click', (ev) =>
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
			(`#role-${currentRole.id}`).remove();
			$('#role-data').remove();

			$('#alert').css('display', 'flex');

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
		$('#section-create').css('display', 'block');
	}

	for (const permission of permissionsData) {
		const clone = checkboxTemplate.contents().clone(true);
		clone.children('span').text(permission.name);

		const input = clone.children('input');
		input.attr('name', permission.intent);

		if (currentRole) {
			if (currentRole.permissions.includes(permission.intent)) {
				input.attr('checked', true);
			}

			if (currentRole.id == 1) {
				input.attr('disabled', true);
			}
		}

		$('#permissions').append(clone);
	}

	$('#alert').css('display', 'none');
	$('#role-data').css('display', 'block');
})();
