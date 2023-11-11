const search = async (searchValue, searchFor='') => {
	const url = searchFor === 'users' ? '/api/users' : '/api/tweets'

	const searchUrl = `${url}?search=${searchValue}` 						// we doesn't create Searching machanisom yet
	const { error, data } = await axios({ url: searchUrl, method: 'GET' })

	if(error) return console.log(error.message)

	return data
}


const tabContentContainer = $('[name=tab-content-container]')

let timer
const searchInput = $('[name=search]')
searchInput.value = '' // empty value on page refresh

searchInput.addEventListener('input', (evt) => {
	clearTimeout(timer) // remove setTimeout() if user press button within 1sec

	let searchValue = searchInput.value.trim()
	let searchFor = location.hash === '#users-tab' ? 'users' : ''

	if(!searchValue) {
		// if search value is empty then don't ajax call 
		// or call again to reset search
		return
	}

	// ajax call inside timer, so that it only call when user finish typing
	timer = setTimeout( async () => { 	
		
		if(searchFor === 'users') {
			const { data } = await search(searchValue, searchFor)
			data.forEach( (user) => {
				tabContentContainer.children[1].insertAdjacentHTML('beforeend', getUserHTML(user))
			})

		} else {
			const { data } = await search(searchValue, searchFor)
			data.forEach(tweet => {
				tabContentContainer.children[0].insertAdjacentHTML('beforeend', getTweetHTML(tweet))
			})
		}

	}, 1000);

})

