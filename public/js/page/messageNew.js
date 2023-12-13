import { Snackbar, getUserHTML } from '/js/module/components/index.js'
import { $, axios, stringToElement, redirectTo } from '/js/module/utils.js'


/* Global Variables 
		. logedInUser
*/

//- Disable button if input is empty
const messageInput = $('[name=message-input]')
const createChatButton = $('[name=create-chat]')
const crossInputButton = $('[name=cross-input-button]')
const usersContainer = $('#users-container')

createChatButton.disabled = true

//- messageInput.addEventListener('input', (evt) => {
//- 	createChatButton.disabled = !evt.target.value.trim()  
//- })

messageInput.value = '' 	// reset input value on page refresh
crossInputButton.addEventListener('click', (evt) => {
	messageInput.value = ''
	usersContainer.innerHTML = ''
	document.querySelectorAll('.selected-username').forEach(el => el.remove())
	createChatButton.disabled = true
})



let timer 
const selectedUsers = [] 	// from user selection
createChatButton.disabled = !selectedUsers.length

const selectedUsersContainer = $('#selected-users-container')




messageInput.addEventListener('keydown', (evt) => {
	clearTimeout(timer) 											// remove timer if user going typing and typing
	const inputValeue = evt.target.value.trim()

	if(!inputValeue && evt.keyCode === 8) {
		selectedUsers.pop()
		createChatButton.disabled = !selectedUsers.length
		selectedUsersContainer.lastChild?.remove()

		return
	}

	timer = setTimeout(async() => {
		usersContainer.innerHTML = '' 		// clear container before append something
		const searchOnFields = 'username,firstName,lastName'

		const { data, error } = await axios({ 
			url: `/api/users?_search=${inputValeue},${searchOnFields}`, 
			method: 'GET' 
		})
		if(error) {
			Snackbar({
				severity: 'error',
				variant: 'filled',
				message: error.message || 'search user failed',
				action: true,
			})

			return console.log(`search user  failed: ${error.message}`)
		}

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
	usersContainer.insertAdjacentElement('beforeend', userElement)

	userElement.addEventListener('click', (evt) => {
		selectedUsers.push( user ) 	
		addSelectedUserBeforeInput(selectedUsers)
		createChatButton.disabled = !selectedUsers.length

		messageInput.value = ''
		messageInput.focus()
		usersContainer.innerHTML = ''
	})
}

const addSelectedUserBeforeInput = (selectedUsers) => {
	document.querySelectorAll('.selected-username').forEach(el => el.remove())

	selectedUsers.forEach( (user) => {
		const fullName = `${user.firstName} ${user.lastName}`
		const htmlString = `
			<button id=${user._id} class='selected-username hover:bg-slate-100 active:bg-slate-200'> 
				 ${fullName} 
			</button>
		`
		selectedUsersContainer.insertAdjacentHTML('beforeend', htmlString)
	})
}


selectedUsersContainer.addEventListener('click', (evt) => {
	if( evt.target.tagName === 'BUTTON') {
		const userIndex = selectedUsers.findIndex( user => user.id === evt.target.id )
		selectedUsers.splice( userIndex, 1)

		evt.target.remove()
	}
})


createChatButton.addEventListener('click', async (evt) => {
	if(!selectedUsers) return
	const selectedUsersIds = selectedUsers.map( user => user._id )

	const { data, error } = await axios({
		url: '/api/chats',
		method: 'POST',
		data: selectedUsersIds 
	})
	if(error) {
		Snackbar({
			severity: 'error',
			variant: 'filled',
			message: error.message || 'create chat failed',
			action: true,
		})

		return console.log(`create chat  failed: ${error.message}`)
	}

	const chat = data.data
	redirectTo(`/message/${chat._id}`)
})