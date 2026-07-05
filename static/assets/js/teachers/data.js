
(async () =>
{
	const serial = new URLSearchParams(location.search).get('serial');
	const attendanceTemplate = $('#attendance');

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

	/**
	 * @param {Date} date 
	 * @param {boolean} isEntry 
	 */
	function addEntryToTable(date, isEntry)
	{
		const clone = attendanceTemplate.contents().clone(true);

		clone.children('[data-id=datetime]').text(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
		clone.children('[data-id=type]').text(isEntry ? 'Entrada' : 'Salida');

		$('#attendances').append(clone);
	}

	{
		const response = await fetch('/data/attendances.json');

		/**
		 * @type {{ code: number, data: { id: string, is_entry: boolean, created_at: number }[] }}
		 */
		const json = await response.json();

		for (const attendance of json.data) {
			addEntryToTable(new Date(attendance.created_at), attendance.is_entry);
		}
	}

	let lastCheckWasEntry = false;

	$('#simulate').on('click', () =>
	{
		lastCheckWasEntry = !lastCheckWasEntry;
		addEntryToTable(new Date(), lastCheckWasEntry);
	});
})();
