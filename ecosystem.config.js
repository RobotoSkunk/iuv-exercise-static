
module.exports = {
	apps: [
		{
			name: 'iuv-project-site',
			script: 'index.ts',
			interpreter: '~/.bun/bin/bun',
			cwd: './',
			max_restarts: 10,
		}
	]
}