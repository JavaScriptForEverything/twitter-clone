import { Snackbar } from '/js/module/components/index.js'
import $, { axios } from '/js/module/utils.js'

// handle followers and following
/* Global Variables
		. logedInUser
		. profileUser
		. Cropper 		from cropper CDN
*/



const url = new URL(location.href) 
const tabName = url.pathname.split('/').pop()
if(tabName === 'followers') {
	$('[name=tab-container]').children[0].classList.remove('tab-active')
	$('[name=tab-container]').children[1].classList.add('tab-active')

	$('[name=tab-content-container]').children[0].hidden=true
	$('[name=tab-content-container]').children[1].hidden=false
}

//- // show follow button only others user, not self user
//- const followContainer = $('[name=follow-container]')
//- followContainer.classList.toggle('invisible', profileUser.username === logedInUser.username )


//-----[ Tabs container ]-----
$('[name=tab-container]').addEventListener('click', (evt) => {

	// Step-1: add active tab style
	Array.from(evt.currentTarget.children).forEach( (tab, index) => {
		tab.classList.toggle('tab-active', +evt.target.id === index)
	}) 

	// Step-2: Show Active Tab content
	Array.from( document.querySelectorAll('.tab-item') ).forEach((tabItem, index) => {
		tabItem.hidden = evt.target.id !== index.toString()
	})
})



//-----[ following Button ]-----
// console.log(profileUser.following)
// console.log(profileUser.followers)

$('[name=tab-content-container]').addEventListener('click', async (evt) => {
	if(evt.target.tagName !== 'BUTTON' || !evt.target.id  ) return

		const button = evt.target
		const field = button.name 		// following | followers

		// console.log(button.name, button.id)

		const doc = profileUser?.[field].find( user => user._id == button.id)
		const profileUsersFollowingOrFowwlowersId = doc._id 
		console.log(profileUsersFollowingOrFowwlowersId)


		const { data, error } = await axios({
			url: `/api/users/${profileUsersFollowingOrFowwlowersId}/following`,
			method: 'PATCH',
		})

		if(error) {
			Snackbar({
				severity: 'error',
				variant: 'filled',
				message: error.message || 'toggle following failed',
				action: true,
			})

			return console.log(`toggle following failed: ${error.message}`)
		}

		const updatedLogiedInUser = data?.data
		console.log(updatedLogiedInUser)


		evt.target.closest('[name=follow-list]').remove()

})





