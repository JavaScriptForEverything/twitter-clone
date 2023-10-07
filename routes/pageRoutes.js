const { Router } = require('express')
const pageController = require('../controllers/pageController')

const router = Router()

router.get('/', pageController.homePage)

router.route('/register')
	.get(pageController.registerPage)
	.post(pageController.registerPageHandler)

router.route('/login')
	.get(pageController.loginPage)
	.post(pageController.loginPageHandler)



module.exports = router