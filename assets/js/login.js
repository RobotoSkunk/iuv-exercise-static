
let showPassword = false;

$('#show-password').on('click', (ev) =>
{
	ev.preventDefault();
	showPassword = !showPassword;

	/**
	 * @type {HTMLImageElement}
	 */
	const eyeIcon = $('#eye-icon');
	eyeIcon.attr('src', showPassword ? '/assets/icon/eye-slash.svg' : '/assets/icon/eye.svg');
	eyeIcon.attr('alt', showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');

	$('#password').attr('type', showPassword ? 'text' : 'password');
});

$('form').on('submit', (ev) =>
{
	ev.preventDefault();

	if (!ev.target.checkValidity()) {
		ev.target.reportValidity();
		return;
	}

	sessionStorage.setItem('logged-in', '1');
	location.href = '/';
});

if (sessionStorage.getItem('logged-in') !== null) {
	location.href = '/';
}
