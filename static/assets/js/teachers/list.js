
/**
 * @param {{ serial: string, name: string, lastname_father: string, lastname_mother: string }} teacher
 */
function insertRow(teacher)
{
	const template = $('#teacher-row');

	// Nota: esto es ridículamente inseguro y solo se usó de esta manera
	// para terminar la actividad lo más rápido posible.
	const html = template.html()
		.replaceAll('$SERIAL', teacher.serial)
		.replace('$NAME', teacher.name)
		.replace('$LASTNAME_FATHER', teacher.lastname_father)
		.replace('$LASTNAME_MOTHER', teacher.lastname_mother);

	const row = $(html);
	const tr = $('<tr>');
	tr.html(row);

	if (!identity.role.permissions.includes('teacher.delete')) {
		row.children('a[data-action=delete]').remove();
	} else {
		row.children('a[data-action=delete]').on('click', async (ev) =>
		{
			ev.preventDefault();

			const answer = confirm(
				`¿Estás seguro de eliminar este docente del sistema (cédula ${teacher.serial})? ` +
				'Esta acción es permanente y no se puede deshacer.'
			);

			if (answer) {
				await fetch(`/api/teachers/${teacher.serial}`, { method: 'DELETE' });

				Notifications.push('success', 'Se ha eliminado el docente.');
				tr.remove();
			}
		});
	}

	$('#teachers-list').append(tr);
}

(async () =>
{
	const response = await fetch('/api/teachers');

	/**
	 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string }[] }}
	 */
	const json = await response.json();
	
	for (const teacher of json.data) {
		insertRow(teacher);
	}
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
		data[key] = value;
	}

	try {
		const response = await fetch(`/api/teachers`, {
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

		form.reset();
		insertRow(data);
	} catch (error) {
		console.error(error);
	}
});
