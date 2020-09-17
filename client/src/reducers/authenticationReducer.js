import { userConstants } from "../_constants/userConstants";

const user = JSON.parse(localStorage.getItem("user"));
const initialState = user ? { loggedIn: false, user } : {};

const authentication = (state = initialState, action) => {
	switch (action.type) {
		case userConstants.LOGIN_REQUEST:
			return {
				...state,
				loggingIn: true,
			};
		case userConstants.LOGIN_SUCCESS:
			return {
				...state,
				loggedIn: true,
				user: action.user,
			};
		case userConstants.LOGIN_FAILURE:
			return {};
		default:
			return state;
	}
};

export default authentication;
