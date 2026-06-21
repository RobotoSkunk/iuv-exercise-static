
(async () =>
{
	const serial = new URLSearchParams(location.search).get('serial');

	if (!serial) {
		location.href = '/docente/lista.html';
		return;
	}

	{
		const response = await fetch('/data/teachers.json');

		/**
		 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string }[] }}
		 */
		const json = await response.json();

		const teacherData = json.data.find(d => d.serial == serial);
		if (!teacherData) {
			location.href = '/docente/lista.html';
			return;
		}

		$('#name').val(teacherData.name);
		$('#lastname_father').val(teacherData.lastname_father);
		$('#lastname_mother').val(teacherData.lastname_mother);
	}

	{
		const response = await fetch('/data/attendances.json');

		/**
		 * @type {{ code: number, data: { id: string, is_entry: boolean, created_at: number }[] }}
		 */
		const json = await response.json();

		const attendanceTemplate = $('#attendance');

		for (const attendance of json.data) {
			const clone = attendanceTemplate.contents().clone(true);
			const date = new Date(attendance.created_at);

			clone.children('[data-id=datetime]').text(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
			clone.children('[data-id=type]').text(attendance.is_entry ? 'Entrada' : 'Salida');

			$('#attendances').append(clone);
		}
	}
})();
