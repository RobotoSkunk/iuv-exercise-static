
(async () =>
{
	const response = await fetch('/data/teachers.json');

	/**
	 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string }[] }}
	 */
	const json = await response.json();
	const template = $('#teacher-row');

	for (const teacher of json.data) {
		// Nota: esto es ridículamente inseguro y solo se usó de esta manera
		// para terminar la actividad lo más rápido posible.
		const html = template.html()
			.replaceAll('$SERIAL', teacher.serial)
			.replace('$NAME', teacher.name)
			.replace('$LASTNAME_FATHER', teacher.lastname_father)
			.replace('$LASTNAME_MOTHER', teacher.lastname_mother);

		const row = $('<tr>');
		row.html(html);

		row.children('a[data-action=delete]').on('click', (ev) =>
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

		$('#teachers-list').append(row);
	}
})();
