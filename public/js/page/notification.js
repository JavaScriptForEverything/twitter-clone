import { Snackbar, List } from '../module/components/index.js'
import { $, axios, redirectTo, updateNotificationBadge } from '../module/utils.js'


/* Global Variables: 
		. logedInUser 		: res.render('./page/search', payload)
*/


let isAllOpened = false
const notificationContainer = $('[name=notification-container]')
const listContainer = $('[name=list-container]')
const loadingIndicator = $('[name=page-loading-indicator]')
const checkAllButton = $('[name=check-all]')


//	// input(type="hidden" id='refresh' value='no')
// window.addEventListener('pageshow', async (evt) => {
// 	const input = $('#refresh')
// 	input.value === 'yes' ? window.location.reload(true) : input.value = 'yes'
// })





const fetchInitialNotifications = async () => {
	loadingIndicator.classList.remove('hidden')

	const { data, error } = await axios({ url: '/api/notifications?_limit=50' })	
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'fetch all notification failed',
			action: true,
		})

		loadingIndicator.classList.add('hidden')
		return console.log(`fetch all notification failed: ${error.message}`)
	}

	loadingIndicator.classList.add('hidden')

	const notifications = data.data
	isAllOpened = notifications.every( doc => doc.isOpened === true )
	checkAllButton.classList.toggle('active-check', isAllOpened)

	notifications.forEach( ({ _id, userFrom, type, kind, isOpened, entityId }) => {
		const listHtmlString =	List({
			id: _id,
			isHover: true,
			isActive: !isOpened,
			secondary: `${userFrom.fullName} ${type} your ${kind}`,
			avatar: userFrom.avatar,
			icon: logedInUser._id === userFrom._id ? `
				<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6l-5.6 5.6Z"/></svg>
			`: ''
		})

		let url = '#'
		if( kind === 'tweet' ) 	url = `/tweet/${entityId}`
		if( kind === 'message') url = `/message/${entityId}`
		if( kind === 'user' ) 	url = `/profile/${entityId}`
		
		const listWrapper = ` <a href='${url}'> ${listHtmlString} </a>`
		notificationContainer.insertAdjacentHTML('beforeend', listWrapper )
	})
}
fetchInitialNotifications()



// PATCH 	/api/notifications/:id 		: list click handler
notificationContainer.addEventListener('click', async (evt) => {
	if(evt.target.name === 'list-icon') return
	evt.preventDefault()

	const container = evt.target.closest('[name=list-container]')
	const notificationId = container.id


	const { data, error } = await axios({ 
		url: `/api/notifications/${notificationId}`, 
		method: 'PATCH',
		data: { isOpened: true } 		//=> true : viewed, 	[ flase: new, not views yet ]
	})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'isOpened notification failed',
			action: true,
		})

		return console.log(`isOpened notification failed: ${error.message}`)
	}

	// Show updated Notification badge here

	// container.classList.remove('bg-slate-200','border-slate-300')
	container.classList.add('bg-slate-50')

	const a = evt.target.closest('a')
	// redirectTo(a.href)

	const link = document.createElement('a')
	link.href = a.href
	link.click()

	// NB.
	// 	. Browser history.back() === BackButton : 
	// 			load page from cache, so it shows old selection
	// 			to remove that selection have bellow senerio
	// 				1. Reload the page when try to go back
	// 				2. Show notifications lists from client-side instead of server-side. (better choise)
})


// DELETE 	/api/notifications/:id 		: cross button click handler
notificationContainer.addEventListener('click', async (evt) => {
	if(evt.target.name !== 'list-icon') return
	evt.preventDefault()

	const container = evt.target.closest('[name=list-container]')
	const notificationId = container.id

	const { data, error } = await axios({ url: `/api/notifications/${notificationId}`, method: 'DELETE', })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'delete notification failed',
			action: true,
		})

		return console.log(`delete notification failed: ${error.message}`)
	}

	const a = evt.target.closest('a')
	a.remove()
	updateNotificationBadge()
})


// PATCH 	/api/notifications/ 				: check-all button handler
checkAllButton.addEventListener('click', async (evt) => {
	const { error, data } = await axios({ url: '/api/notifications', method: 'PATCH' })

	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'read all notification failed',
			action: true,
		})

		return console.log(`read all notification failed: ${error.message}`)
	}

	evt.target.classList.toggle('active-check')
	notificationContainer.querySelectorAll('[name=list-container]').forEach( (list) => {
		list.style.borderColor = '#cbd5e1'
		list.style.backgroundColor = '#f8fafc'
	})
})




