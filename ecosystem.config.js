
module.exports = {
	name: 'iuv-project-static',
	script: 'index.ts',
	interpreter: 'bun',
	cwd: './',
	max_restarts: 10,
	env: {
		PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
	},
}
