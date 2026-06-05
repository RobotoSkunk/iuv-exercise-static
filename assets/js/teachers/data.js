
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

		document.getElementById('name').value = teacherData.name;
		document.getElementById('lastname_father').value = teacherData.lastname_father;
		document.getElementById('lastname_mother').value = teacherData.lastname_mother;
	}

	{
		const response = await fetch('/data/attendances.json');

		/**
		 * @type {{ code: number, data: { id: string, is_entry: boolean, created_at: number }[] }}
		 */
		const json = await response.json();

		/**
		 * @type {HTMLTemplateElement}
		 */
		const attendanceTemplate = document.getElementById('attendance');

		for (const attendance of json.data) {
			const clone = document.importNode(attendanceTemplate.content, true);
			const date = new Date(attendance.created_at);

			clone.querySelector('[data-id=datetime]').innerText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
			clone.querySelector('[data-id=type]').innerText = attendance.is_entry ? 'Entrada' : 'Salida';

			document.getElementById('attendances').append(clone);
		}
	}
})();
