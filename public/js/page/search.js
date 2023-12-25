import { Snackbar, List, getTweetHTML, getUserHTML } from '../module/components/index.js'
import { $, axios } from '../module/utils.js'


/* Global Variables: 
		. logedInUser 		: res.render('./page/search', payload)
*/


const url = new URL(location.href) 
if(url.hash === '#users-tab') { 	 //- /search | /search/#tweets-tab | /search/#users-tab
	$('[name=tab-container]').children[0].classList.remove('tab-active')
	$('[name=tab-container]').children[1].classList.add('tab-active')

	$('[name=tab-content-container]').children[0].hidden=true
	$('[name=tab-content-container]').children[1].hidden=false
} else {
	$('[name=tab-container]').children[0].classList.add('tab-active')
}

//-----[ Tabs container ]-----
$('[name=tab-container]').addEventListener('click', (evt) => {
const url = new URL(location.href) 
if(url.hash === '#users-tab') { 	 //- /search | /search/#tweets-tab | /search/#users-tab
	$('[name=tab-container]').children[0].classList.remove('tab-active')
	$('[name=tab-container]').children[1].classList.add('tab-active')

	$('[name=tab-content-container]').children[0].hidden=true
	$('[name=tab-content-container]').children[1].hidden=false
} 


	// Step-1: add active tab style
	Array.from(evt.currentTarget.children).forEach( (tab, index) => {
		tab.classList.toggle('tab-active', +evt.target.id === index)
	}) 

	// Step-2: Show Active Tab content
	Array.from( document.querySelectorAll('.tab-item') ).forEach((tabItem, index) => {
		tabItem.hidden = evt.target.id !== index.toString()
	})
})




//-----[ other functionality ]-----
const tabContentContainer = $('[name=tab-content-container]')
const tweetsContentContainer = tabContentContainer.children[0]
const usersContentContainer = tabContentContainer.children[1]

let timer
const searchInput = $('[name=search-bar]')
searchInput.value = '' // empty value on page refresh



const fetchInitialData = async (tab = 'tweets') => {
	const url = tab !== 'tweets' ? '/api/users' : '/api/tweets'

	const { data, error} = await axios({ url })
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'tweetError failed',
			action: true,
		})

		return console.log(`tweetError failed: ${error.message}`)
	}

	const tabs = data.data
	tabs?.forEach( doc => {
		if(tab === 'tweets') {
			tweetsContentContainer.insertAdjacentHTML('beforeend', getTweetHTML(doc, logedInUser, { 
				showIcons: false,
				showPinLabel: false
			}))
		}

		if(tab === 'users') {
			const user = doc
			const listHtmlString = List({
				primary: `${user.firstName} ${user.lastName}`,
				secondary: user.username,
				avatar: user.avatar,
		// icon: `
		// 	<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6l-5.6 5.6Z"/></svg>
		// `
			})

			const linkWrapper = `
				<a href='/profile/${user.username}'>
					${listHtmlString}
				</a>
			`

			usersContentContainer.insertAdjacentHTML('beforeend', linkWrapper)
			// usersContentContainer.insertAdjacentHTML('beforeend', getUserHTML( doc))
		}
	})
}
fetchInitialData('tweets')
fetchInitialData('users')


const fetchBySearchData = async ({ searchValue='', searchFor='' }) => {
	const url = searchFor === 'users' ? '/api/users' : '/api/tweets'
	const searchOnFields = searchFor === 'users' ? 'firstName,lastName,username' : 'tweet'


	const searchUrl = `${url}?_search=${searchValue},${searchOnFields}` 						// we doesn't create Searching machanisom yet
	const { error, data } = await axios({ url: searchUrl })

	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'SearchError failed',
			action: true,
		})

		return console.log(`SearchError failed: ${error.message}`)
	}

	return data
}


searchInput.addEventListener('input', (evt) => {
	clearTimeout(timer) // remove setTimeout() if user press button within 1sec

	let searchValue = searchInput.value.trim()
	let searchFor = location.hash === '#users-tab' ? 'users' : 'tweets'

	timer = setTimeout( async () => { 	
		const { data } = await fetchBySearchData({ searchValue, searchFor })
		
		const tabs = data

		const element = searchFor === 'users' ? usersContentContainer : tweetsContentContainer
					element.innerHTML = ''

		tabs?.forEach( doc => {
			if(searchFor === 'tweets') {
				tweetsContentContainer.insertAdjacentHTML('beforeend', getTweetHTML( doc, logedInUser))
			}

			if(searchFor === 'users') {
				// usersContentContainer.insertAdjacentHTML('beforeend', getUserHTML( doc, logedInUser))
				const user = doc
				const listHtmlString = List({
					primary: `${user.firstName} ${user.lastName}`,
					secondary: user.username,
					avatar: user.avatar,
				})

				const linkWrapper = `
					<a href='/profile/${user.username}'>
						${listHtmlString}
					</a>
				`
				usersContentContainer.insertAdjacentHTML('beforeend', linkWrapper)

			}
		})

	}, 1000)
})

