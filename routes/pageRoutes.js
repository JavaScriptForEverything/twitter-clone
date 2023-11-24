const { Router } = require('express')
const pageController = require('../controllers/pageController')
const authController = require('../controllers/authController')

const router = Router()

	// .get('/message', authController.messageInboxPage) 
	// .get('/message/new', authController.newMessageInboxPage) 
	// .get('/message/:id', authController.chatMessagePage) 


router.route('/testing')
	.get(pageController.testing)

router.get('/', authController.protect, pageController.homePage)

router.route('/register')
	.get(pageController.registerPage)
	.post(pageController.registerPageHandler)

router.route('/login')
	.get(pageController.loginPage)
	.post(pageController.loginPageHandler)

router.route('/logout')
	.get(pageController.logout)


router
	.use(authController.protect)
	.get('/profile', authController.profilePage)
	.get('/profile/:id', authController.profilePage)
	.get('/profile/:id/following', authController.followingAndFollwers)
	.get('/profile/:id/followers', authController.followingAndFollwers)
	.get('/tweet/:id', authController.tweetDetailsPage)
	.get('/search', authController.searchPage) // /search#tab-1 /search#tab-2

	.get('/message', authController.messageInboxPage) 
	.get('/message/new', authController.newMessageInboxPage) 
	.get('/message/:id', authController.chatMessagePage) 

	.get('/notification', authController.notificationPage) 

module.exports = router