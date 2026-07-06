
/**
 * 
 * @param {{ serial: string, name: string, lastname_father: string, lastname_mother: string, role: string }} admin 
 */
function insertRow(admin)
{
	const template = $('#admin-row');

	// Nota: esto es ridículamente inseguro y solo se usó de esta manera
	// para terminar la actividad lo más rápido posible.
	const html = template.html()
		.replaceAll('$SERIAL', admin.serial)
		.replace('$NAME', admin.name)
		.replace('$LASTNAME_FATHER', admin.lastname_father)
		.replace('$LASTNAME_MOTHER', admin.lastname_mother)
		.replace('$ROLE', admin.role);

	const row = $(html);

	const tr = $('<tr>');
	tr.append(row);

	if (identity.serial == admin.serial || !identity.role.permissions.includes('admin.delete')) {
		row.children('a[data-action=delete]').remove();
	} else {
		row.children('a[data-action=delete]').on('click', async (ev) =>
		{
			ev.preventDefault();

			const answer = confirm(
				`¿Estás seguro de eliminar este administrador (cédula ${admin.serial})? ` +
				'Esta acción es permanente y no se puede deshacer.'
			);

			if (answer) {
				await fetch(`/api/admins/${admin.serial}`, { method: 'DELETE' });

				Notifications.push('success', 'Se ha eliminado el administrador.');
				tr.remove();
			}
		});
	}

	$('#admins-list').append(tr);
}

/**
 * @type {{ id: number, name: string, permissions: string[] }[]}
 */
let roles;

// Cargar administradores
(async () =>
{
	const response = await fetch('/api/admins');

	/**
	 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string, role: string }[] }}
	 */
	const json = await response.json();

	for (const admin of json.data) {
		insertRow(admin);
	}
})();

// Cargar roles
(async () =>
{
	const response = await fetch('/api/roles');

	/**
	 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
	 */
	const json = await response.json();

	for (const role of json.data) {
		const optionElement = $('<option>');
		optionElement.val(role.id);
		optionElement.text(role.name);

		$('#roles').append(optionElement);
	}

	roles = json.data;
})();

$('form').on('submit', async (ev) =>
{
	ev.preventDefault();

	/**
	 * @type {HTMLFormElement}
	 */
	const form = ev.currentTarget;

	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const formData = new FormData(form);
	const data = {};

	for (const [ key, value ] of formData.entries()) {
		if (key === 'role_id') {
			data[key] = Number.parseInt(value);
		} else {
			data[key] = value;
		}
	}

	try {
		const response = await fetch(`/api/admins`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const json = await response.json();

		if (json.code !== 0) {
			alert(json.error);
			return;
		}


		data.role = roles.find(r => r.id == data.role_id).name;

		form.reset();
		insertRow(data);
	} catch (error) {
		console.error(error);
	}
});
