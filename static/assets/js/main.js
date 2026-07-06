
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
		 * @type {JQuery<HTMLTemplateElement>}
		 */
		const template = $('#notification');
		const clone = template.contents().clone(true);

		clone.addClass(type);
		clone.attr('id', id);

		const span = clone.children('span');
		span.text(content);

		const button = clone.children('button');
		button.on('click', () => this.remove(id));

		setTimeout(() => this.remove(id), 6000);

		$('#notifications').append(clone);
	}

	/**
	 * @param {string} id 
	 */
	static remove(id)
	{
		const notification = $(`#${id}`);
		notification.addClass('remove');

		setTimeout(() => notification.remove(), 260);
	}
}

(async() =>
{
	{
		const response = await fetch('/api/identity');
		const json = await response.json();

		if (json.code != 0) {
			location.href = '/iniciar-sesion.html';
			return;
		}
	}


	// Load layout
	const response = await fetch('/layout.html');
	const html = await response.text();
	document.body.innerHTML += html;

	const contentTemplate = $('#page-content');
	$('main').append(contentTemplate.contents());
	contentTemplate.remove();

	const headTemplate = $('#head');
	$('head').append(headTemplate.contents());
	headTemplate.remove();

	$('#logout').on('click', async (ev) =>
	{
		ev.preventDefault();

		await fetch('/api/auth/logout', { method: 'POST' });
		location.href = '/iniciar-sesion.html';
	});

	// Load scripts
	const scriptsMeta = $('meta[name=scripts]');

	if (scriptsMeta.length) {
		const scriptPaths = scriptsMeta.attr('content').split(':');

		for (const path of scriptPaths) {
			const scriptElement = document.createElement('script');
			scriptElement.src = path;
			scriptElement.defer = true;

			document.head.append(scriptElement);
		}

		scriptsMeta.remove();
	}
})();
