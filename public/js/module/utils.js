import { Snackbar } from './components/index.js'


export const $ = selector => document.querySelector(selector)
export default $

export const redirectTo = (path, { base='' } = {}) => {
	const url = new URL( path, base || location.origin ) 		// get current url
	location.href = url.href 	
}


// Convert '<p> hi </p>' 	=> .createElement('p').textContent = 'hi'
export const stringToElement = ( htmlString ) => {
	const parser = new DOMParser()
	const doc = parser.parseFromString( htmlString, 'text/html' )

	return doc.body.firstChild
}



/*
const { data, error } = await axios({
	url: `/api/tweets/${tweetId}/retweet`,
	method: 'post',
	data: { tweetId }
})
if(error) return console.log(error.message)

console.log(data)
*/
export const axios = async(option) => {
	let output = {
		data: {},
		error: null
	}

	const { 
		url, 
		method= 'GET', 
		isConvertToObject=true, 
		data 
	} = option

	const body = isConvertToObject ? JSON.stringify(data) : data
	const headers = option.headers || {
		'content-type': 'application/json',
		'accept': 'application/json',
	}

	try {
		const res = await fetch(url, { 
			method: method.toUpperCase(), 
			body: body ? body: undefined, 
			headers 
		})

		const result = await res.json()

		// handle ServerSide: user throw error 							: return next( appError('...') )
		if(result.message) throw new Error(result.message) 		

		// handle ServerSide: unhandled error 							: return next( '...' ) or any error
		if( !res.ok ) throw new Error('Unknown Error') 				

		output.data = result

	} catch (err) {
		output.error = {
			message: err.message,
		}
	}

	return output
}




document.addEventListener('DOMContentLoaded', async () => {
	updateNotificationBadge()
	updateMessageBadge()
})
export const updateNotificationBadge = async () => {
	const notificationBadge = $('[name=notification-badge]')
	if(!notificationBadge) return 		// not every page has menu: like login, signup,  error, /docs

	const { data, error } = await axios({ url: '/api/notifications '})
	if(error) {
		// Snackbar({
		// 	severity: 'error', 											// success | info | warning | error
		// 	message: error.message || 'Notification Badge: /api/chats?unreadOnly=true failed',
		// })
		return
	}

	// console.log(data.data)

	// notificationBadge.textContent = data.count
	const unReadedNotifications = data.data.filter( (notification) => !notification.isOpened )
	notificationBadge.textContent = unReadedNotifications.length
	notificationBadge.style.opacity = unReadedNotifications.length ? 1 : 0 	// boolean value not work
}

export const updateMessageBadge = async () => {
	// Call this function before page loade once
	// Call this in 'new-message' event so that update this badge on new message too

	const messageBadge = $('[name=message-badge]')
	if(!messageBadge) return 		// not every page has menu: like login, signup,  error, /docs

	const { data, error } = await axios({ url: '/api/chats?unreadOnly=true'})
	// const { data, error } = await axios({ url: '/api/messages'})
	if(error) {
		Snackbar({
			severity: 'error', 											// success | info | warning | error
			message: error.message || 'messageBadge : /api/chats?unreadOnly=true failed',
		})
	}

	const unReadedMessages = data.data.filter( (messageDoc) => !messageDoc.isOpened )
	messageBadge.textContent = unReadedMessages.length
	messageBadge.style.opacity = unReadedMessages.length ? 1 : 0 	// boolean value not work
}







export const isFormValidated = (obj) => {
	const errorObject = {}

	// if( obj.username && obj.username.length < 4)  errorObj.username = 'name reqired 4 digit long'
	//- if( obj.email && !isEmail(obj.email) ) errorObj.email = 'Invalid Email address' 

	// if(obj.password && obj.password.length < requireLength ) errorObj.password = `Password must be ${requireLength} character long`
	// if(obj.password && obj.confirmPassword && obj.password !== obj.confirmPassword) errorObj.confirmPassword = 'Confirm Password not matched'


	Object.entries(obj).forEach(([key, value]) => {
		if(!value?.trim()) errorObject[key]=`${key} filed is emapty`
	})

	return Object.keys(errorObject).every((field => field == '' ))
}


// Google: javascript day and time ago
export const timeSince = (date) => {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";
  
  return Math.floor(seconds) + " seconds";
}
// var aDay = 24*60*60*1000;
// console.log(timeSince(new Date(Date.now()-aDay)));
// console.log(timeSince(new Date(Date.now()-aDay*2)));
// console.log( timeSince( new Date('2023-10-15T10:05:15.632Z') ) )



// it prevent HTML XSS Attack
export const encodeHTML = (string) => string
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&apos;')

export const decodeHTML = (string) => string
	.replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&quot;/g, '"')
	.replace(/&apos;/g, "'")






// used into Reply-Dialog icon clicked style
export const toggleIcon = (evt, props = {}) => {
	const { activeColor='red', inactiveColor='gray', isValue = true, } = props

		const childSVG = evt.target.children[0]
		const childSpan = evt.target.children[1]
		if(childSVG.tagName !== 'svg') return console.log(`Selector: '${childSVG}' is not svg `)
		if(childSpan.tagName !== 'SPAN') return console.log(`Selector: '${childSpan}' is not span`)

		childSVG.style.color = childSVG.style.color === activeColor ? inactiveColor : activeColor
		//- if( isValue ) childSpan.textContent = childSpan.textContent ? "" : 1
}









// not used, instead used from server side
const getChatNameRenamingDialog = (props = {}) => {
	const {
		fullName = '',
		username = '',
		createdAt = Date.now(),
		avatar = '/images/users/default.jpg',
		replyAvatar = '/images/users/default.jpg',
		tweet = '',
		numberOfHeart=0,
		numberOfRetweet=0,
	} = props

	return `
		<dialog open="true" name='change-chat-group-name' class="w-80 text-slate-700 rounded border border-slate-300 shadow ">
			<div class="flex flex-col divide-y">
				<div class="flex justify-between items-center px-4 py-2 " id="header">
					<h1 class="font-semibold text-slate-800">Reply</h1>
					<button name='dialog-close-button' class="p-1 rounded-full" type="button" ">
						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg></button>
				</div>
				<div class="flex-1 px-4 py-3 divide-y divide-slate-50/50" id="content">
					<div class="flex gap-2 pb-2">
						<img class="w-8 h-8" src="${avatar}" alt="${avatar}">
						<div class="text-sm text-slate-700">

							<div class="flex items-center gap-2">
								<h1 class="font-semibold text-slate-800">${fullName}</h1>
								<span>@${username} </span>
								<span>${createdAt}</span>
							</div>

							<p class="my-2 text-slate-800">${tweet}</p>

							<div id="actions" class="flex justify-between items-center gap-2 mb-1 mt-3 text-slate-600">
								<button name='dialog-chat-button' class="flex items-center gap-1" type="button" id="chat">
									<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="m174.72 855.68l130.048-43.392l23.424 11.392C382.4 849.984 444.352 864 512 864c223.744 0 384-159.872 384-352c0-192.832-159.104-352-384-352S128 319.168 128 512a341.12 341.12 0 0 0 69.248 204.288l21.632 28.8l-44.16 110.528zm-45.248 82.56A32 32 0 0 1 89.6 896l56.512-141.248A405.12 405.12 0 0 1 64 512C64 299.904 235.648 96 512 96s448 203.904 448 416s-173.44 416-448 416c-79.68 0-150.848-17.152-211.712-46.72l-170.88 56.96z"/></svg>
									<span class="pointer-events-none"></span>
								</button>
								<button name='dialog-retweet-button' class="flex items-center gap-1" type="button" id="retweet">
									<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="M136 552h63.6c4.4 0 8-3.6 8-8V288.7h528.6v72.6c0 1.9.6 3.7 1.8 5.2a8.3 8.3 0 0 0 11.7 1.4L893 255.4c4.3-5 3.6-10.3 0-13.2L749.7 129.8a8.22 8.22 0 0 0-5.2-1.8c-4.6 0-8.4 3.8-8.4 8.4V209H199.7c-39.5 0-71.7 32.2-71.7 71.8V544c0 4.4 3.6 8 8 8zm752-80h-63.6c-4.4 0-8 3.6-8 8v255.3H287.8v-72.6c0-1.9-.6-3.7-1.8-5.2a8.3 8.3 0 0 0-11.7-1.4L131 768.6c-4.3 5-3.6 10.3 0 13.2l143.3 112.4c1.5 1.2 3.3 1.8 5.2 1.8c4.6 0 8.4-3.8 8.4-8.4V815h536.6c39.5 0 71.7-32.2 71.7-71.8V480c-.2-4.4-3.8-8-8.2-8z"/></svg>
									<span class="pointer-events-none">${numberOfRetweet || ""}</span>
								</button>
								<button name='dialog-heart-button' class="flex items-center gap-1" type="button" id="heart">
									<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Zm-50 174.8C109.74 196.16 32 147.69 32 94a46.06 46.06 0 0 1 46-46c19.45 0 35.78 10.36 42.6 27a8 8 0 0 0 14.8 0c6.82-16.67 23.15-27 42.6-27a46.06 46.06 0 0 1 46 46c0 53.61-77.76 102.15-96 112.8Z"/></svg>
									<span class="pointer-events-none">${numberOfHeart || ""}</span>
								</button>
							</div>

						</div>
					</div>
					<div class="flex gap-2 pt-3">
						<img class="w-8 h-8" src="${replyAvatar}" alt="${replyAvatar}">
						<div>
							<input name='dialog-tweet-input' class="bg-slate-100/50 border border-slate-300 w-full px-2 py-0.5 rounded placeholder:text-sm outline-none focus:border-blue-500" type="text" placeholder="Type your reply">
						</div>
					</div>
				</div>
				<div class="px-4 py-3 my-1 flex justify-end items-end gap-2" id="footer">
					<button name='dialog-cancel-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 px-2 py-1 bg-slate-500 text-slate-100 rounded-md text-sm border border-slate-500 hover:bg-slate-600 hover:text-white" type="button" ">Cancel</button>
					<button name='dialog-submit-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 disabled:border-slate-500 px-2 py-1 bg-blue-500 text-slate-100 rounded-md text-sm border border-blue-500 hover:bg-blue-600 hover:text-white" type="submit"">Submit</button>
				</div>
			</div>
		</dialog>
	`
}




// add active color on left side menu item
const activateMenUItem = () => {
	const navContainer = $('#nav-container')
	if(!navContainer) return

	const navItems = Array.from(navContainer.children)
	const targetedEl = navItems.find( (navItem) => navItem.href === location.href)
	if(!targetedEl) return
	targetedEl.style.fill = '#3b82f6'
}
document.addEventListener('DOMContentLoaded', activateMenUItem)












const toggleIcon2 = (evt) => {
	let count = 1
	setInterval(() => {
		console.log(count)
		count++
	}, 1000)

}
