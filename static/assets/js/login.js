
let showPassword = false;

$('#show-password').on('click', (ev) =>
{
	ev.preventDefault();
	showPassword = !showPassword;

	/**
	 * @type {JQuery<HTMLImageElement>}
	 */
	const eyeIcon = $('#eye-icon');
	eyeIcon.attr('src', showPassword ? '/assets/icon/eye-slash.svg' : '/assets/icon/eye.svg');
	eyeIcon.attr('alt', showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');

	$('#password').attr('type', showPassword ? 'text' : 'password');
});

$('form').on('submit', async (ev) =>
{
	ev.preventDefault();

	const form = ev.currentTarget;

	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const formData = new FormData(form);
	const data = {};

	for (const [ key, value ] of formData.entries()) {
		data[key] = value;
	}

	try {
		const response = await fetch(`/api/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		const json = await response.json();

		if (json.code !== 0) {
			alert(json.error);
			return;
		}

		location.href = '/';
	} catch (error) {
		console.error(error);
	}
});

(async () =>
{
	const response = await fetch('/api/identity');
	const json = await response.json();

	if (json.code == 0) {
		location.href = '/';
	}
})();
