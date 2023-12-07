import { $, isFormValidated } from '../module/utils.js'

$('input[name=confirmPassword]').addEventListener('input', (evt) => {
		const password = $('input[name=password]').value
		const confirmPassword = evt.target.value

	if( confirmPassword !== password ) {
		$('#confirmPassword').style.border = '1px solid red'
		$('#confirmPassword legend').style.color = 'red'

	} else {
		$('#confirmPassword').style.border = ''
		$('#confirmPassword legend').style.color = ''
	}
})


$('form').addEventListener('submit', (evt) => {
	evt.preventDefault()

	const formData = new FormData(evt.target)
	const fields = Object.fromEntries( formData )


	/* it will submit the form by the: 	<form method='post'>
	** No need `fetch('/register', { method: 'post' , ...})`
	*/ 

	if( !isFormValidated(fields) ) {
		console.log('Invalid form')
		$('#error').innerHTML = 'Form Validation fialed'

		//- console.log(fields)
		return 
	}
	evt.target.submit() 	// form.submit()


	// for development purpose: immediately submit the form
})
