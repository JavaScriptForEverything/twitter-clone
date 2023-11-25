// const hljs = require('highlight.js/lib/common')
const hljs = require('highlight.js')

// GET /docs/
exports.home = (req, res) => {
	const payload = {
		pageTitle: 'Docs | Home Page',
		// hljs,
	}
	res.render('docs/home', payload)
}
