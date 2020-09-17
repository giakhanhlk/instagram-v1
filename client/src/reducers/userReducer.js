import { userConstants } from "../_constants/userConstants";

const initialState = {
	loadingUser: true,
	updatingUser: false,
	deleting: false,
	hasError: false,
	data: {
		_id: "",
		firstName: "",
		lastName: "",
		email: "",
		profilePicture: "person.png",
		bio: "",
		followers: 0,
		followings: 0,
		postsCount: 0,
		allNotifications: 0,
		notificationsCount: 0,
		messagesCount: 0,
		followingIds: [],
		posts: [],
		followingUsers: [],
		followerUsers: [],
		notifications: [],
		postLikes: [],
		commentLikes: [],
		commentReplyLikes: [],
	},
};

const user = (state = initialState, action) => {
	switch (action.type) {
		case userConstants.GETUSER_REQUEST:
			return {
				...state,
				loadingUser: true,
			};
		case userConstants.GETUSER_SUCCESS:
			return {
				...state,
				data: {
					...state.data,
					...action.user,
				},
				loadingUser: false,
			};
		default:
			return state;
	}
};

export default user;
