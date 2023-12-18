const { Router } = require('express');
const docController = require('../controllers/docController')

const router = Router()

router
	.get('/', docController.home)
	.get('/api-features', docController.apiFeatures)



module.exports = router