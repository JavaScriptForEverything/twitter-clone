// const $ = (selector) => document.querySelector( selector )
// console.log($)

//----------[ scroll effect ]----------
const observer = new IntersectionObserver((entries) => {
	entries.forEach( (entry) => {
		entry.target.classList.toggle('show', entry.isIntersecting)
	})
}, {
	threshold: .1,
	rootMargin: '50px'
})
document.querySelectorAll('.hide').forEach( (el) => {
	observer.observe( el )
})