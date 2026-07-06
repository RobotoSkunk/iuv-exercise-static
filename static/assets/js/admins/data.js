const serial = new URLSearchParams(location.search).get('serial');

(async () =>
{
	if (!serial) {
		location.href = '/administrador/lista.html';
		return;
	}

	{
		const response = await fetch(`/api/admins/${serial}`);

		/**
		 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string, role: string, role_id: number }[] }}
		 */
		const json = await response.json();

		if (json.code != 0) {
			location.href = '/administrador/lista.html';
			return;
		}

		$('#name').val(json.data.name);
		$('#lastname_father').val(json.data.lastname_father);
		$('#lastname_mother').val(json.data.lastname_mother);


		const rolesResponse = await fetch('/api/roles');

		/**
		 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
		 */
		const rolesJson = await rolesResponse.json();

		for (const role of rolesJson.data) {
			const option = $('<option>');
			option.val(role.id);
			option.text(role.name);
			option.attr('selected', role.id == json.data.role_id);

			$('#role').append(option);
		}
	}
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
		if (key === 'role_id') {
			data[key] = Number.parseInt(value);
		} else {
			data[key] = value;
		}
	}

	try {
		const response = await fetch(`/api/admins/${serial}`, {
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
