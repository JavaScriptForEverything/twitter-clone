
# Twitter-clone

Live Demo: https://twitter-clone-06nd.onrender.com/ 

Documentation: https://twitter-clone-06nd.onrender.com/docs

Project Sample: `/public/project-design`  directory


### Technology 
- Node, express
- MongoDB (mongoose)
- Pug (Templete Engine)
- Tailwind-css ()
- Socket.io (Messaging, notification)





| Home Page                           | Profile Page                        | 
| ----------------------------------- | ----------------------------------- | 
| ![Home](https://github.com/JavaScriptForEverything/twitter-clone/blob/master/public/project_design/home.png) | ![Profile](https://github.com/JavaScriptForEverything/twitter-clone/blob/master/public/project_design/profile.png) | 





### key-features Key features: [ by users point of view ]
- Social media app like twitter
- Follow and unfollow other users
- Create tweet, like/unlike tweet, and also retweet 
- Upload profile photo, Cover photo.
- Real Time chatting: Group chat, private chat
- To create Group chat search users by name and shows selected users list before create chat
- in chat page will show all users on that chat room, in top with user avatar
- Users will see typing indicator of other users while chating.


### key-features Key features: [ by Developers point of view ]
- Hydration Rendering : ServerSide rendering + ClientSide rendering
- API features : pagination, sorting, filtering, searching
- Image upload : crop image, image with private route
- Error handling : Express Globar Error handler + ClientSide error handler
- Real-Time chat, notification By socket.io private or custom room
- Project Setup: Node-Express, MongoDB (mongoose), Pug-templete tailwind-css, 
	- Browser refresh on file change, Session based authentication.
- Handle some security machanism, like: Content Security Policy for XSS attack,
	- HTML parser
- Animation/Transition: scrolling animation, dialog transition, ...etc
- Searcing APIs when user stop typing
- Tailwind-express with MVC architechture (Model, View, Controller)
- Configure express-session
- Creating Components similer as `Material-UI` by `tailwind CSS`


- Upload image (avatar) the right way
	- Preview image
	- Crop image
	- Upload image 
	- Update avatar image (No Duplication)


- Chat Interface
	- Create chats by selecting user list one by one, and selected users will be shows on top
	- Shows chats or chat groups with user logos
	- Chat details page

