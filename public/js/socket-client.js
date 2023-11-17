
let isConnected = false

if( logedInUser ) socket.emit('setup', logedInUser)
socket.on('connected', () => isConnected = true)