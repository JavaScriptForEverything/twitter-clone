
// GET /docs/
exports.home = (req, res) => {
	const payload = {
		pageTitle: 'Docs | Home Page',
	}
	res.render('docs/home', payload)
}

// GET /docs/api-features
exports.apiFeatures = (req, res) => {
	const payload = {
		pageTitle: 'Docs | API Features',
	}
	res.render('docs/apiFeatures', payload)
}
