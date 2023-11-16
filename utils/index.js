const path = require('path')
const fs = require('fs');
const { appError } = require('../controllers/errorController');


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