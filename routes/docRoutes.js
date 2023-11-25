const { Router } = require('express');
const docController = require('../controllers/docController')

const router = Router()

router
	.get('/', docController.home)



module.exports = router