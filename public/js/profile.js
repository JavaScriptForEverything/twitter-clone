// Cropper available via cropper cdn

$('[name=avatar-container]').addEventListener('click', (evt) => {

	const uploadProfilePictureDialog = `
		<dialog open=false name="avatar-dialog" class="z-10 w-2/3 md:max-w-md text-slate-700 rounded border border-slate-300 shadow">
			<div class="flex flex-col divide-y">

				<div class="flex justify-between items-center px-4 py-2 " id="header">
					<h1 class="font-semibold text-slate-800">Upload new profile picture</h1> 
					<button name='dialog-close-button' class="p-1 rounded-full" type="button">
						<svg class='w-3 h-3 pointer-events-none' xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"/></svg>
					</button>
				</div>

				<div class="px-4 py-2">
					<input type="file" name="avatar-input" accept='image/*'>
					<div class="flex justify-center mt-1 rounded shadow">
						<img 
							name='image-preview' 
							class='block max-w-full' 
							src="${logedInUser.avatar || '/images/users/default.jpg'}" 
							alt="image-preview"
						>
					</div>
				</div>
				

				<div class="px-4 py-3 my-1 flex justify-end items-end gap-2" id="footer">
					<button name='dialog-cancel-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 px-2 py-1 bg-slate-500 text-slate-100 rounded-md text-sm border border-slate-500 hover:bg-slate-600 hover:text-white" type="button">Cancel</button> 
					<button name='dialog-submit-button' class="disabled:bg-slate-500/50 disabled:text-slate-600 disabled:border-slate-500 px-2 py-1 bg-blue-500 text-slate-100 rounded-md text-sm border border-blue-500 hover:bg-blue-600 hover:text-white" type="submit">Save</button>
				</div>

			</div>
		</dialog>
	`
	$('#forModalContainer').insertAdjacentHTML('afterbegin', uploadProfilePictureDialog)

	let cropper;

	const dialog = $('[name=avatar-dialog]')
	const closeButton = $('[name=dialog-close-button]')
	const cancelButton = $('[name=dialog-cancel-button]')
	const submitButton = $('[name=dialog-submit-button]')
	const avatarInput = $('[name=avatar-input]')
	const avatar = $('[name=avatar]')
	const image = $('[name=image-preview]')

	closeButton.addEventListener('click', () => dialog.close())
	cancelButton.addEventListener('click', () => dialog.close())
	submitButton.addEventListener('click', () => {
		if(!cropper) return console.log('please choose image and save that')

		const canvas = cropper.getCroppedCanvas()
		canvas.toBlob( async (blob) => {
			const formData = new FormData()
			formData.append('avatar', blob)

			const res = await fetch('/api/users/avatar', {
				method: 'POST',
				body: formData
			})

			const data = await res.json()
			const user = data.data
			avatar.src = user.avatar

			dialog.close()
		})
	})

	avatarInput.addEventListener('change', (evt) => {
		const ImageFile = evt.target.files[0]
		if(!ImageFile.type.match('image/*')) console.log('it is not image')

		const reader = new FileReader()
		reader.readAsDataURL(ImageFile)

		reader.addEventListener('loadend', () => {
			image.src = reader.result

			cropper = new Cropper(image, {
				aspectRatio: 1/1,
				background: false
			})
		})

	})
})