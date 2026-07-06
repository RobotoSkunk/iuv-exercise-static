
(async () =>
{
	const serial = new URLSearchParams(location.search).get('serial');

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
