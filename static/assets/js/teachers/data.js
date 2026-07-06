const serial = new URLSearchParams(location.search).get('serial');

(async () =>
{
	const attendanceTemplate = $('#attendance');

	if (!serial) {
		location.href = '/docente/lista.html';
		return;
	}

	{
		const response = await fetch(`/api/teachers/${serial}`);

		/**
		 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string }[] }}
		 */
		const json = await response.json();

		if (json.code != 0) {
			location.href = '/docente/lista.html';
			return;
		}

		$('#name').val(json.data.name);
		$('#lastname_father').val(json.data.lastname_father);
		$('#lastname_mother').val(json.data.lastname_mother);
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

$('form').on('submit', async (ev) =>
{
	ev.preventDefault();

	const form = ev.currentTarget;

	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const formData = new FormData(ev.currentTarget);
	const data = { };

	for (const [ key, value ] of formData.entries()) {
		data[key] = value;
	}

	try {
		const response = await fetch(`/api/teachers/${serial}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const json = await response.json();

		if (!json.error) {
			Notifications.push('success', 'Datos actualizados exitosamente.');
		} else {
			Notifications.push('error', json.error);
		}
	} catch (error) {
		alert('Algo ha salido mal, intenta de nuevo más tarde');
		console.error(error);
	}
});
