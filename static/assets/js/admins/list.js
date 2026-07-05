
// Cargar administradores
(async () =>
{
	const response = await fetch('/data/admins.json');

	/**
	 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string, role: string }[] }}
	 */
	const json = await response.json();
	const template = $('#admin-row');

	for (const admin of json.data) {
		// Nota: esto es ridículamente inseguro y solo se usó de esta manera
		// para terminar la actividad lo más rápido posible.
		const html = template.html()
			.replaceAll('$SERIAL', admin.serial)
			.replace('$NAME', admin.name)
			.replace('$LASTNAME_FATHER', admin.lastname_father)
			.replace('$LASTNAME_MOTHER', admin.lastname_mother)
			.replace('$ROLE', admin.role);

		const row = $('<tr>');
		row.html(html);

		row.children('a[data-action=delete]').on('click', (ev) =>
		{
			ev.preventDefault();

			const answer = confirm(
				`¿Estás seguro de eliminar este administrador (cédula ${admin.serial})? ` +
				'Esta acción es permanente y no se puede deshacer.'
			);

			if (answer) {
				Notifications.push('success', 'Se ha eliminado el administrador.');
				row.remove();
			}
		});

		$('#admins-list').append(row);
	}
})();

// Cargar roles
(async () =>
{
	const response = await fetch('/data/roles.json');

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
})();
