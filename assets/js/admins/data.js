
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

		document.getElementById('name').value = teacherData.name;
		document.getElementById('lastname_father').value = teacherData.lastname_father;
		document.getElementById('lastname_mother').value = teacherData.lastname_mother;


		const rolesResponse = await fetch('/data/roles.json');

		/**
		 * @type {{ code: number, data: { id: number, name: string, permissions: string[] }[] }}
		 */
		const rolesJson = await rolesResponse.json();

		for (const role of rolesJson.data) {
			const option = document.createElement('option');
			option.value = role.id;
			option.innerText = role.name;
			option.selected = role.id == teacherData.role_id;

			document.getElementById('role').append(option);
		}
	}
})();
