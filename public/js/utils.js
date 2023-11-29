const $ = selector => document.querySelector(selector)
const socket = io('/')


// Convert '<p> hi </p>' 	=> .createElement('p').textContent = 'hi'
const stringToElement = ( htmlString ) => {
	const parser = new DOMParser()
	const doc = parser.parseFromString( htmlString, 'text/html' )

	return doc.body.firstChild
}



const isFormValidated = (obj) => {
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
function timeSince(date) {
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
const encodeHTML = (string) => string
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&apos;')

const decodeHTML = (string) => string
	.replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&quot;/g, '"')
	.replace(/&apos;/g, "'")







/*
const { data, error } = await axios({
	url: `/api/tweets/${tweetId}/retweet`,
	method: 'post',
	data: { tweetId }
})
if(error) return console.log(error.message)

console.log(data)
*/
const axios = async(option) => {
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


const redirectTo = (path, { base='' } = {}) => {
	const url = new URL( path, base || location.origin ) 		// get current url
	location.href = url.href 	
}

const toggleIcon2 = (evt) => {
	let count = 1
	setInterval(() => {
		console.log(count)
		count++
	}, 1000)

}

// used into Reply-Dialog icon clicked style
const toggleIcon = (evt, props = {}) => {
	const { activeColor='red', inactiveColor='gray', isValue = true, } = props

		const childSVG = evt.target.children[0]
		const childSpan = evt.target.children[1]
		if(childSVG.tagName !== 'svg') return console.log(`Selector: '${childSVG}' is not svg `)
		if(childSpan.tagName !== 'SPAN') return console.log(`Selector: '${childSpan}' is not span`)

		childSVG.style.color = childSVG.style.color === activeColor ? inactiveColor : activeColor
		//- if( isValue ) childSpan.textContent = childSpan.textContent ? "" : 1
}



const getUserHTML = (user, profileUser={}, fieldname = 'following') => {
	const textContent = user?.[fieldname].includes(profileUser._id) ? 'followed' : 'Following'

	return `
		<div name='follow-list' class='border-b border-b-slate-100 py-1.5 flex items-center gap-2 cursor-pointer'>
			<img src='${user.avatar}' alt=user.avatar class='w-10 h-10 rounded-full' />
			<div class='flex-1 flex items-baseline gap-2 text-slate-900'>
				<span class='font-medium'> ${user.firstName} ${user.lastName}</span>
				<span class='text-slate-500 text-sm hover:underline hover:decoration-dashed hover:text-blue-700'> 
					@${user.username}
				</span>
			</div>

			<button type='button' id=user._id name=fieldname
				class='h-8 px-3 py-1.5 rounded-3xl bg-blue-500 text-white font-medium text-sm capitalize'
				class='hover:bg-blue-600 active:bg-blue-700'
			> ${textContent} </button>
		</div>
	`
}




const getTweetHTML = (tweet, { isModal=false, showIcons=true, showPinLabel=true } = {}) => {
	const isRetweetedByUser = logedInUser.retweets.includes(tweet._id)
	const isLovedByUser = tweet.likes.includes(logedInUser._id)
	const isLogedInUser = tweet.user._id === logedInUser._id

	if(!tweet) return console.log('tweet object not found')
	if(!tweet.user?._id) return console.log(`{tweet.user} not populated`)

		// ${isModal ? '' : "<hr class='mb-4' />" }

	return `<div class='tweet-container border-b border-slate-200' id=${tweet._id}>

		${tweet.retweet ?  `
			<h2 
				class='mt-2 mb-1 text-slate-600 hover:text-slate-700 px-4 text-xs font-medium uppercase'
			>
				REPOTED BY : @${tweet.user.username}
			</h2>

		` : '' }

		<div class='px-4 py-2 text-slate-700 flex gap-4'>
			<img
				src=${tweet.user.avatar}
				alt=${tweet.user.avatar}
				class='${isModal ? 'w-8 h-8 ' : 'w-12 h-12 rounded-full border border-blue-500 shadow-md p-0.5'}' 
			/>

			<div name='pin-label-container' class='[&>button]:mt-2 flex-1'>
				${tweet.pinned && showPinLabel ? `
					<div name='pin-label' class='flex gap-0.5 items-center mb-0.5 text-slate-500'>
						<svg class='w-3 h-3' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479c-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/></svg>
						<span class='text-xs'> Pinned Tweet </span>
					</div>` : '' }

				<div class='flex gap-0.5 items-center'>
					<div class='flex gap-2 text-slate-700 hover:text-slate-900 cursor-pointer'>
						<a href="/profile/${tweet.user.username}" title='/profile/${tweet.user.username}'>
							<p class='profile hover:underline hover:decoration-dotted text-blue-600 whitespace-nowrap' > ${tweet.user.firstName} ${tweet.user.lastName}</p> 
						</a>
						<a href="/tweet/${tweet._id}" title='/tweet/${tweet._id}'>
							<p class='redirect'> @${tweet.user.username} </p> 
						</a>
						<a href="/tweet/${tweet._id}" title='/tweet/${tweet._id}'>
							<p class='redirect w-20 truncate'>${timeSince(new Date(tweet.createdAt))}</p> 
						</a>
					</div>

					${isModal ? '' : isLogedInUser ? `
							<button id='pin-button' name='pin-button' type='button' 
							class='${tweet.pinned ? 'active': ''} disabled:hover:bg-transparent ml-auto ${tweet.pinned ? 'text-slate-500 ' : 'text-slate-50 stroke-slate-600'} hover:bg-slate-200 p-1 rounded-full active:bg-slate-300' >
								<svg class='w-3 h-3  pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479c-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354z"/></svg>
							</button>
							<button id='delete-button' name='delete-button' type='button' class='disabled:hover:bg-transparent text-slate-600 hover:bg-slate-200 p-1 rounded-full active:bg-slate-300' >
								<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
							</button>
						`: ''
					}
				</div>

				${tweet.replyTo?.user ? `
				<p class='text-xs mb-2'>
					<span>Repling To</span>
					<span class='text-blue-700'>@${tweet.replyTo.user.username}</span>
				</p> ` :''}

				<p class='text-slate-600 text-sm'> ${tweet.tweet || 'no message'}</p> 

				${showIcons ? `
				<div class='mt-3 pointer-events-none'>
					<div id="actions" class="pointer-events-none flex justify-between items-center gap-2 mb-1 mt-3 text-slate-600">
						<button name='chat-button' class="pointer-events-auto flex items-center gap-1" type="button" id="chat">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="m174.72 855.68l130.048-43.392l23.424 11.392C382.4 849.984 444.352 864 512 864c223.744 0 384-159.872 384-352c0-192.832-159.104-352-384-352S128 319.168 128 512a341.12 341.12 0 0 0 69.248 204.288l21.632 28.8l-44.16 110.528zm-45.248 82.56A32 32 0 0 1 89.6 896l56.512-141.248A405.12 405.12 0 0 1 64 512C64 299.904 235.648 96 512 96s448 203.904 448 416s-173.44 416-448 416c-79.68 0-150.848-17.152-211.712-46.72l-170.88 56.96z"/></svg>
							<span class="pointer-events-none">${''}</span>
						</button>
						<button name='retweet-button' class="${isRetweetedByUser ? 'text-blue-600': ''} pointer-events-auto flex items-center gap-1" type="button" id="retweet">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="M136 552h63.6c4.4 0 8-3.6 8-8V288.7h528.6v72.6c0 1.9.6 3.7 1.8 5.2a8.3 8.3 0 0 0 11.7 1.4L893 255.4c4.3-5 3.6-10.3 0-13.2L749.7 129.8a8.22 8.22 0 0 0-5.2-1.8c-4.6 0-8.4 3.8-8.4 8.4V209H199.7c-39.5 0-71.7 32.2-71.7 71.8V544c0 4.4 3.6 8 8 8zm752-80h-63.6c-4.4 0-8 3.6-8 8v255.3H287.8v-72.6c0-1.9-.6-3.7-1.8-5.2a8.3 8.3 0 0 0-11.7-1.4L131 768.6c-4.3 5-3.6 10.3 0 13.2l143.3 112.4c1.5 1.2 3.3 1.8 5.2 1.8c4.6 0 8.4-3.8 8.4-8.4V815h536.6c39.5 0 71.7-32.2 71.7-71.8V480c-.2-4.4-3.8-8-8.2-8z"/></svg>
							<span class="pointer-events-none">${tweet.retweetUsers.length || ""}</span>
						</button>
						<button name='heart-button' class="${isLovedByUser ? 'text-blue-600': ''} pointer-events-auto mr-10 flex items-center gap-1" type="button" id="heart">
							<svg class='pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M178 32c-20.65 0-38.73 8.88-50 23.89C116.73 40.88 98.65 32 78 32a62.07 62.07 0 0 0-62 62c0 70 103.79 126.66 108.21 129a8 8 0 0 0 7.58 0C136.21 220.66 240 164 240 94a62.07 62.07 0 0 0-62-62Zm-50 174.8C109.74 196.16 32 147.69 32 94a46.06 46.06 0 0 1 46-46c19.45 0 35.78 10.36 42.6 27a8 8 0 0 0 14.8 0c6.82-16.67 23.15-27 42.6-27a46.06 46.06 0 0 1 46 46c0 53.61-77.76 102.15-96 112.8Z"/></svg>
							<span class="pointer-events-none">${tweet.likes.length || ""}</span>
						</button>
					</div>
				</div>
				` : ''}

			</div>
		</div>
	</div>`

}


/*
const listHtmlString =	List({
	isHover: true,
	primary: 'List primary',
	secondary: 'list summary goes here',
	avatar: '/images/users/default.jpg',
	images: ['/images/users/default.jpg', '/images/users/default.jpg'],
	icon: `
		<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6l-5.6 5.6Z"/></svg>
	`
})

const listWrapper = `
	<a href='/tweet/tweetId/'>
		${listHtmlString}
	</a>
`
document.querySelector('#container').insertAdjacentHTML('beforeend', listWrapper )
*/
const List = (props = {}) => {

	const {
		primary='',
		secondary='',
		avatar= '',
		images=[],
		icon= '',
		isHover= false,
		isActive=false,
		id='',
		name='list-container',
	} = props

	const imageSize = (primary && secondary) ? 'w-12 h-12' : 'w-8 h-8'

	const htmlString = `
	<div
		class=" group border-b border-slate-200 px-3 py-1.5 rounded-sm  
			${isHover ? 'hover:bg-slate-100 active:bg-slate-200' : ''}
			${isActive ? 'bg-slate-200 border-slate-300' : 'bg-slate-50'}
		"
		id=${id}
		name=${name}
		>
		<div class='flex gap-2 items-center '>
			${ images.length ? `
				<div class='relative w-8 h-8'>
					<img src=${images[0]} alt="images[0]" class='absolute -top-1 left-3 w-8 h-8 rounded-full border border-slate-300' />
					<img src=${images[1]} alt="images[1]" class='absolute top-2 left-0 w-8 h-8 rounded-full border border-slate-300' />
				</div>
			` : `
				${avatar ? `
					<img src=${avatar} alt="avatar" class='${imageSize} rounded-full border border-slate-300' />
				` : ''}
			`}

			<div class=${images.length ? 'ml-4' : ''}>
				${primary ? `
					<h2 class='text-slate-700 font-medium hover:text-slate-800 truncate w-60'> ${primary} </h2>
				` : ''}
				${secondary ? `
					<p class='text-slate-700/95 hover:text-slate-800/90 font-light text-sm truncate w-60'> 
						${decodeHTML(secondary)} 
					</p>
				` : ''}
			</div>

			${icon ? `
			<button type='button' name='list-icon' 
				class="
					ml-auto p-0.5 text-slate-600 rounded-full bg-slate-200 border border-slate-200
				group-hover:bg-slate-300 group-hover:border-slate-300 hover:bg-slate-300 hover:border-slate-300 hover:text-slate-700
				group-active:border-slate-400 active:bg-blue-400 active:border-blue-500 active:text-blue-600
				"
			> 
				${icon}
			</button>
			` :''}
		</div>
	</div>
	`

	return htmlString
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



// document.addEventListener('DOMContentLoaded', () => {

// 	const dialog = $('dialog')
// 	const dialogCloseButton = $('[name=dialog-close-button]')
// 	const dialogCancelButton = $('[name=dialog-cancel-button]')

// 	const closeHandler = () => dialog.close()
	
// 	dialogCloseButton?.addEventListener('click', closeHandler)
// 	dialogCancelButton?.addEventListener('click', closeHandler)
// })




/*
const div = $('.col-span-10')
Alert(div, {
	variant: 'filled', 			// text | contained | filled
	severity: 'error', 			// success | info | warning | error
	showSeverity: false,
	action: true,
	autoClose: true,
	closeTime: 20000,
	message: 'My message',
	title: 'Testing'
})
*/
const Alert = (selector, props={}, elementPosition='beforeend') => {

	const {
		severity='success',
		variant='text',
		title='',
		message='Alert message goes here',
		action=false,
		showSeverity=true,
		autoClose=false,
		closeTime = 5000,
	} = props

	const successHtmlString = `
		<div class="flex items-start gap-4 text-green-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-green-100/50 border-green-100' : ''}
			${ variant === 'outlined' ? 'border-green-600' : ''}
			${ variant === 'filled' ? 'bg-green-500 text-white' : ''}
		">
			${showSeverity 
				? `
					<svg class=""  width="24" height="24" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SuccessOutlinedIcon"><path fill="currentColor"  d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path></svg> 
				`: ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-green-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-green-900'}">  ${message} </p>
			</div>

			${action ? `
				<button type='button' id='close' class=" ml-auto rounded-full p-0.5 ${ variant === 'filled' ? 'hover:bg-green-600/60 active:bg-green-600' : 'hover:bg-green-100 active:bg-green-200' } ">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			`: ''}
		</div>
	`

	const infoHtmlString = `
		<div class=" flex items-start gap-4 text-sky-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-sky-100/50 border-sky-100' : ''}
			${ variant === 'outlined' ? 'border-sky-600' : ''}
			${ variant === 'filled' ? 'bg-sky-500 text-white' : ''}
		">
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.712T12 7q-.425 0-.712.288T11 8q0 .425.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"/></svg>
			` : '' }

			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-sky-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-sky-900'}"> ${message} </p>
			</div>

			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-sky-600/60 active:bg-sky-600' : 'hover:bg-sky-100 active:bg-sky-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const warningHtmlString = `
		<div class=" flex items-start gap-4 text-orange-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-orange-100/50 border-orange-100' : ''}
			${ variant === 'outlined' ? 'border-orange-600' : ''}
			${ variant === 'filled' ? 'bg-orange-500 text-white' : ''}
		"> 
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.001 10h2v5h-2zM11 16h2v2h-2z"/><path fill="currentColor" d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19L12 5.137L19.344 19z"/></svg>
			` : ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-orange-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-orange-900'}"> ${message} </p>
			</div>
			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-orange-600/60 active:bg-orange-600' : 'hover:bg-orange-100 active:bg-orange-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const errorHtmlString = `
				<div class="
					flex items-start gap-4 text-red-600 px-4 py-3 rounded border 
					${ variant === 'text' ? 'bg-red-100/50 border-red-100' : ''}
					${ variant === 'outlined' ? 'border-red-600' : ''}
					${ variant === 'filled' ? 'bg-red-500 text-white' : ''}
				">
					${showSeverity ? `
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8"/></svg>
					` : ''}
					<div>
						${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-red-900 '} font-semibold'> ${title} </h1> ` : ''} 
						<p class="${variant==='filled' ? '' : 'text-red-900'}"> ${message} </p>
					</div>

					${action ? `
						<button type='button' class=" ml-auto rounded-full p-0.5
							${ variant === 'filled' ? 'hover:bg-red-600/60 active:bg-red-600' : 'hover:bg-red-100 active:bg-red-200' }
						">
							<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
						</button>
					` : ''}
				</div>
	`

	let htmlString = successHtmlString
	if( severity === 'success') htmlString = successHtmlString
	if( severity === 'info') htmlString = infoHtmlString
	if( severity === 'warning') htmlString = warningHtmlString
	if( severity === 'error') htmlString = errorHtmlString


	const element = stringToElement(htmlString)
	if( !element ) return console.error('element is null')
	const closeButton = element.querySelector('button')

	selector.insertAdjacentElement(elementPosition, element)

	const closeHandler = () => element.remove()
	if( autoClose ) setTimeout(closeHandler, closeTime);
	closeButton?.addEventListener('click', closeHandler)
}



/*
$('div').addEventListener('click', (evt) => {

	Snackbar({
		severity: 'error', 											// success | info | warning | error
		message: 'notification update failed',
		// position: 'top-1 right-1' 						// tailwind class
		// variant: 'filled', 									// text | contained | filled
		// showSeverity: false,
		// action: true,
		// autoClose: true,
		// closeTime: 20000,
		// title: 'Testing'
	})

})
*/
const Snackbar = (props={}) => {

	const {
		severity='success',
		variant='filled', 					// text | contained | filled
		title='',
		message='Snackbar message goes here',
		position='top-1 right-1',
		action=props.position || true,
		showSeverity=true,
		autoClose=true,
		closeTime = 5000,
	} = props

	const successHtmlString = `
		<div class="flex items-start gap-4 text-green-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-green-100/50 border-green-100' : ''}
			${ variant === 'outlined' ? 'border-green-600' : ''}
			${ variant === 'filled' ? 'bg-green-500 text-white' : ''}
		">
			${showSeverity 
				? `
					<svg class=""  width="24" height="24" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="SuccessOutlinedIcon"><path fill="currentColor"  d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"></path></svg> 
				`: ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-green-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-green-900'}">  ${message} </p>
			</div>

			${action ? `
				<button type='button' id='close' class=" ml-auto rounded-full p-0.5 ${ variant === 'filled' ? 'hover:bg-green-600/60 active:bg-green-600' : 'hover:bg-green-100 active:bg-green-200' } ">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			`: ''}
		</div>
	`

	const infoHtmlString = `
		<div class=" flex items-start gap-4 text-sky-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-sky-100/50 border-sky-100' : ''}
			${ variant === 'outlined' ? 'border-sky-600' : ''}
			${ variant === 'filled' ? 'bg-sky-500 text-white' : ''}
		">
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.712T12 7q-.425 0-.712.288T11 8q0 .425.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"/></svg>
			` : '' }

			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-sky-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-sky-900'}"> ${message} </p>
			</div>

			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-sky-600/60 active:bg-sky-600' : 'hover:bg-sky-100 active:bg-sky-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const warningHtmlString = `
		<div class=" flex items-start gap-4 text-orange-600 px-4 py-3 rounded border 
			${ variant === 'text' ? 'bg-orange-100/50 border-orange-100' : ''}
			${ variant === 'outlined' ? 'border-orange-600' : ''}
			${ variant === 'filled' ? 'bg-orange-500 text-white' : ''}
		"> 
			${showSeverity ? `
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.001 10h2v5h-2zM11 16h2v2h-2z"/><path fill="currentColor" d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.986 1.986 0 0 0 .054 1.968A1.984 1.984 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.989 1.989 0 0 0 .054-1.968L13.768 4.2zM4.661 19L12 5.137L19.344 19z"/></svg>
			` : ''}
			<div>
				${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-orange-900 '} font-semibold'> ${title} </h1> ` : ''} 
				<p class="${variant==='filled' ? '' : 'text-orange-900'}"> ${message} </p>
			</div>
			${action ? `
				<button type='button' class=" ml-auto rounded-full p-0.5
					${ variant === 'filled' ? 'hover:bg-orange-600/60 active:bg-orange-600' : 'hover:bg-orange-100 active:bg-orange-200' }
				">
					<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
				</button>
			` : ''}
		</div>
	`

	const errorHtmlString = `
				<div class="
					flex items-start gap-4 text-red-600 px-4 py-3 rounded border 
					${ variant === 'text' ? 'bg-red-100/50 border-red-100' : ''}
					${ variant === 'outlined' ? 'border-red-600' : ''}
					${ variant === 'filled' ? 'bg-red-500 text-white' : ''}
				">
					${showSeverity ? `
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.47 2 2 6.5 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8"/></svg>
					` : ''}
					<div>
						${title ? ` <h1 class='${variant === 'filled' ? 'text-white' : 'text-red-900 '} font-semibold'> ${title} </h1> ` : ''} 
						<p class="${variant==='filled' ? '' : 'text-red-900'}"> ${message} </p>
					</div>

					${action ? `
						<button type='button' class=" ml-auto rounded-full p-0.5
							${ variant === 'filled' ? 'hover:bg-red-600/60 active:bg-red-600' : 'hover:bg-red-100 active:bg-red-200' }
						">
							<svg class='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"/></svg>
						</button>
					` : ''}
				</div>
	`

	let htmlString = successHtmlString
	if( severity === 'success') htmlString = successHtmlString
	if( severity === 'info') htmlString = infoHtmlString
	if( severity === 'warning') htmlString = warningHtmlString
	if( severity === 'error') htmlString = errorHtmlString


	const snackbarWrapper = `
		<div class="max-w-sm shadow-2xl z-50 absolute ${position} ">
			${htmlString}
		</div>
	`

	htmlString = position ? snackbarWrapper : htmlString
	// if( snackbar ) insertPosition = 'afterend'

	const element = stringToElement(htmlString)
	if( !element ) return console.error('element is null')
	const closeButton = element.querySelector('button')

	document.body.insertAdjacentElement('beforebegin', element)

	const closeHandler = () => element.remove()
	if( autoClose ) setTimeout(closeHandler, closeTime);
	closeButton?.addEventListener('click', closeHandler)
}