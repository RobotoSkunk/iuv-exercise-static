
if (!sessionStorage.getItem('logged-in')) {
	location.href = '/iniciar-sesion.html';
}

class Notifications
{
	/**
	 * @param {'info' | 'success' | 'alert' | 'error'} type 
	 * @param {string} content 
	 */
	static push(type, content)
	{
		const id = `notif-${Date.now()}`;

		/**
		 * @type {HTMLTemplateElement}
		 */
		const template = document.getElementById('notification');

		const clone = document.importNode(template.content, true);

		const div = clone.querySelector('div');
		div.classList.add(type);
		div.id = id;

		const span = clone.querySelector('span');
		span.innerText = content;

		const button = clone.querySelector('button');
		button.addEventListener('click', () => this.remove(id));

		setTimeout(() => this.remove(id), 6000);

		document.getElementById('notifications').append(clone);
	}

	/**
	 * @param {string} id 
	 */
	static remove(id)
	{
		const notification = document.getElementById(id);
		notification.classList.add('remove');

		setTimeout(() => notification.remove(), 260);
	}
}

(async() =>
{
	// Load layout
	const response = await fetch('/layout.html');
	const html = await response.text();
	document.body.innerHTML += html;

	/**
	 * @type {HTMLTemplateElement}
	 */
	const contentTemplate = document.getElementById('page-content');
	document.querySelector('main').append(contentTemplate.content);
	contentTemplate.remove();

	/**
	 * @type {HTMLTemplateElement}
	 */
	const headTemplate = document.getElementById('head');
	document.head.append(headTemplate.content);
	headTemplate.remove();

	document.getElementById('logout').addEventListener('click', (ev) =>
	{
		ev.preventDefault();

		sessionStorage.removeItem('logged-in', '1');
		location.href = '/iniciar-sesion.html';
	});

	// Load scripts
	/**
	 * @type {HTMLMetaElement | null}
	 */
	const scriptsMeta = document.querySelector('meta[name=scripts]');

	if (scriptsMeta) {
		const scriptPaths = scriptsMeta.content.split(':');

		for (const path of scriptPaths) {
			const scriptElement = document.createElement('script');
			scriptElement.src = path;
			scriptElement.defer = true;

			document.head.append(scriptElement);
		}

		scriptsMeta.remove();
	}
})();
