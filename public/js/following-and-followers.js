// console.log(profileUser.followers)


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





