const path = require('path')
const fs = require('fs');
const { appError } = require('../controllers/errorController');

/*
	{{origin}}/api/reviews
		?_page=2
		&_limit=3
		&_sort=-createdAt,user
		&_search= review,review
		&_fields=review,user,createdAt

	const reviews = await apiFeatures(Review, req.query)
*/
exports.apiFeatures = (Model, query, newFilter={}) => {
	const page = +query._page || 1
	const limit = +query._limit || 4
	const skip = page <= 0 ? 0 : (page - 1) * limit 

	const sort = query._sort?.toString().trim().split(',').join(' ') || '-createdAt'
	const select = query._fields?.toString().trim().split(',').join(' ') || '-_v'

	const search = query._search?.toString().trim().split(',') || ['', '']
	const [ searchValue, ...searchFields ] = search
	let searchObj = {
	"$or" : searchFields.map( field => ({ [field]: { "$regex": searchValue, "$options": "i" } }))
	}
	searchObj = search[1] ? searchObj : {}

	const filter = { ...searchObj, ...newFilter }

	return Model.find(filter) 					// => Searching
		.skip(skip).limit(limit) 					// => Pagination
		.sort( sort ) 										// => Sorting
		.select(select) 									// => Filtering

	/*
		const searchObj = { firstName: { $regex: 'name', $options: 'i'} } 		// single field
		const searchObj = { 																									// multi field
			$or: [
				{ firstName: { $regex: req.query.search, $options: 'i'} },
				{ lastName : { $regex: req.query.search, $options: 'i'} },
				{ username : { $regex: req.query.search, $options: 'i'} },
			]
		} 		
	*/
}




exports.filterObjectByArray = (body={}, allowedFields=[]) => {
	const tempObj = {}

	Object.entries(body).forEach(([key, value]) => {
		if(allowedFields.includes(key)) tempObj[key] = value
	})

	return tempObj
}

// Google: javascript day and time ago
module.exports.timeSince = (date) => {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";
  
  return Math.floor(seconds) + " seconds";
}
// var aDay = 24*60*60*1000;
// console.log(timeSince(new Date(Date.now()-aDay)));
// console.log(timeSince(new Date(Date.now()-aDay*2)));



module.exports.removeFile = (relativePath) => {
	const filepath = path.join( process.cwd(), relativePath )
	fs.unlink(filepath, (err) => {
		if(err) return appError(err.message)
	})
}