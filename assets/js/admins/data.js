
(async () =>
{
	const serial = new URLSearchParams(location.search).get('serial');

	if (!serial) {
		location.href = '/administrador/lista.html';
		return;
	}

	{
		const response = await fetch('/data/admins.json');

		/**
		 * @type {{ code: number, data: { serial: string, name: string, lastname_father: string, lastname_mother: string, role: string, role_id: number }[] }}
		 */
		const json = await response.json();

		const teacherData = json.data.find(d => d.serial == serial);
		if (!teacherData) {
			location.href = '/administrador/lista.html';
			return;
		}

		$('#name').val(teacherData.name);
		$('#lastname_father').val(teacherData.lastname_father);
		$('#lastname_mother').val(teacherData.lastname_mother);


		const rolesResponse = await fetch('/data/roles.json');

		/**
		 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
		 */
		const rolesJson = await rolesResponse.json();

		for (const role of rolesJson.data) {
			const option = $('<option>');
			option.val(role.id);
			option.text(role.name);
			option.attr('selected', role.id == teacherData.role_id);

			$('#role').append(option);
		}
	}
})();
