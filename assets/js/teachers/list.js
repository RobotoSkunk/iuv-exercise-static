
(async () =>
{
	const result = await fetch('/api/teachers.json');

	/**
	 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string }[] }}
	 */
	const json = await result.json();

	/**
	 * @type {HTMLTemplateElement}
	 */
	const template = document.getElementById('teacher-row');

	for (const teacher of json.data) {
		// Nota: esto es ridículamente inseguro y solo se usó de esta manera
		// para terminar la actividad lo más rápido posible.
		const html = template.innerHTML
			.replaceAll('$SERIAL', teacher.serial)
			.replace('$NAME', teacher.name)
			.replace('$LASTNAME_FATHER', teacher.lastname_father)
			.replace('$LASTNAME_MOTHER', teacher.lastname_mother);

		const row = document.createElement('tr');
		row.innerHTML = html;

		row.querySelector('a[data-action=delete]').addEventListener('click', (ev) =>
		{
			ev.preventDefault();

			const answer = confirm(
				`¿Estás seguro de eliminar este docente del sistema (cédula ${teacher.serial})? ` +
				'Esta acción es permanente y no se puede deshacer.'
			);

			if (answer) {
				Notifications.push('success', 'Se ha eliminado el docente.');
				row.remove();
			}
		});

		document.getElementById('teachers-list').append(row);
	}
})();
