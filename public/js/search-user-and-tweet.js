/* Global Variables
		logedInUser 						: comes from 	'/search' controller

*/ 
// console.log( getUserHTML(logedInUser) )

const tabContentContainer = $('[name=tab-content-container]')
const tweetsContentContainer = tabContentContainer.children[0]
const usersContentContainer = tabContentContainer.children[1]

let timer
const searchInput = $('[name=search]')
searchInput.value = '' // empty value on page refresh



const fetchInitialData = async (tab = 'tweets') => {
	const url = tab !== 'tweets' ? '/api/users' : '/api/tweets'

	const { data, error} = await axios({ url, method: 'GET' })
	if(error) return console.log(`tweetError: ${error.message}`)

	const tabs = data.data
	tabs?.forEach( doc => {
		if(tab === 'tweets') {
			tweetsContentContainer.insertAdjacentHTML('beforeend', getTweetHTML(doc, { 
				showIcons: false,
				showPinLabel: false
			}))
		}

		if(tab === 'users') {
			const user = doc
			const listHtmlString = List({
				primary: `${user.firstName} ${user.lastName}`,
				secondary: user.username,
				avatar: user.avatar 
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
const fetchBySearchData = async ({ searchValue='', searchFor='' }) => {
	const url = searchFor === 'users' ? '/api/users' : '/api/tweets'
	const searchOnFields = searchFor === 'users' ? 'firstName,lastName,username' : 'tweet'


	const searchUrl = `${url}?_search=${searchValue},${searchOnFields}` 						// we doesn't create Searching machanisom yet
	const { error, data } = await axios({ url: searchUrl, method: 'GET' })

	if(error) return console.log(error.message)

	return data
}


fetchInitialData('tweets')
fetchInitialData('users')


searchInput.addEventListener('input', (evt) => {
	clearTimeout(timer) // remove setTimeout() if user press button within 1sec

	let searchValue = searchInput.value.trim()
	let searchFor = location.hash === '#users-tab' ? 'users' : 'tweets'

	// if(!searchValue) {
	// 	if(searchFor === 'tweets') {
	// 		tweetsContentContainer.innerHTML = ''
	// 		fetchInitialData('tweets')
	// 	}

	// 	if(searchFor === 'users') {
	// 		usersContentContainer.innerHTML = ''
	// 		fetchInitialData('users')
	// 	}
	// }

	timer = setTimeout( async () => { 	
		const { data } = await fetchBySearchData({ searchValue, searchFor })
		
		const tabs = data

		const element = searchFor === 'users' ? usersContentContainer : tweetsContentContainer
					element.innerHTML = ''

		tabs?.forEach( doc => {
			if(searchFor === 'tweets') {
				tweetsContentContainer.insertAdjacentHTML('beforeend', getTweetHTML( doc))
			}

			if(searchFor === 'users') {
				usersContentContainer.insertAdjacentHTML('beforeend', getUserHTML( doc))
			}
		})

	}, 1000)
})

