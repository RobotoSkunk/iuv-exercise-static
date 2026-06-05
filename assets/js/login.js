
let showPassword = false;

document.getElementById('show-password').addEventListener('click', (ev) =>
{
	ev.preventDefault();
	showPassword = !showPassword;

	/**
	 * @type {HTMLImageElement}
	 */
	const eyeIcon = document.getElementById('eye-icon');
	eyeIcon.src = showPassword ? '/assets/icon/eye-slash.svg' : '/assets/icon/eye.svg';
	eyeIcon.alt = showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';

	document.getElementById('password').type = showPassword ? 'text' : 'password';
});

document.querySelector('form').addEventListener('submit', (ev) =>
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
