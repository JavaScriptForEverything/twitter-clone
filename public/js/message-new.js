// console.log({ logedInUser })


let timer 

// when user clicked any users from search store him into selectedUsers array
const selectedUsers = []
createChatButton.disabled = !selectedUsers.length




// const messageInput = $('[name=message-input]') defined in `new.pug` page
messageInput.value = '' 	// reset input value on page refresh

messageInput.addEventListener('keydown', (evt) => {
	clearTimeout(timer) 											// remove timer if user going typing and typing

	if(!messageInput.value && evt.keyCode === 8) {
		selectedUsers.pop()
		createChatButton.disabled = !selectedUsers.length
		$('#selected-users-container').lastChild.remove()

		return
	}

	timer = setTimeout(async() => {
		$('#users-container').innerHTML = '' 		// clear container before append something

		const { data, error } = await axios({ url: `/api/users`, method: 'GET' })
		if(error) console.log(error.message)

		const users = data?.data
		if(!users) return console.log('users not found')


		data?.data.forEach( (user) => {
			const isAlreadyPickedUp = selectedUsers.find((selectUser) => selectUser._id === user._id)
			if( user._id === logedInUser._id || isAlreadyPickedUp ) return

			showUser(user, logedInUser)
		})

		
		
	}, 1000)
})



const showUser = (user, logedInUser) => {

	const userElement = stringToElement( getUserHTML(user, logedInUser) )
	$('#users-container').insertAdjacentElement('beforeend', userElement)

	userElement.addEventListener('click', (evt) => {
		selectedUsers.push( user ) 	
		addSelectedUserBeforeInput(selectedUsers)
		createChatButton.disabled = !selectedUsers.length

		messageInput.value = ''
		messageInput.focus()
		$('#users-container').innerHTML = ''



		// console.log(selectedUsers)
	})
}

const addSelectedUserBeforeInput = (selectedUsers) => {
	document.querySelectorAll('.selected-username').forEach(el => el.remove())

	selectedUsers.forEach( user => {
		const username = `${user.firstName} ${user.lastName}`
		const htmlString = `<span class='selected-username'> ${username} </span>`

		$('#selected-users-container').insertAdjacentHTML('beforeend', htmlString)
	})
}


createChatButton.addEventListener('click', async (evt) => {
	if(!selectedUsers) return
	const selectedUsersIds = selectedUsers.map( user => user._id )

	const { data, error } = await axios({
		url: '/api/chats',
		method: 'POST',
		data: selectedUsersIds 
	})
	if(error) return console.log(error.message)

	const chat = data.data
	redirectTo(`/message/${chat._id}`)
})