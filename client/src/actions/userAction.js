import { userConstants } from "../_constants/userConstants";
import * as userService from "../_services/userService";
import { history } from "../_helpers/history";
import { alertActions } from "./alertAction";

const login = (email, password) => async (dispatch) => {
	const request = (user) => {
		return { type: userConstants.LOGIN_REQUEST, user };
	};
	const success = (user) => {
		return { type: userConstants.LOGIN_SUCCESS, user };
	};
	const failure = (error) => {
		return { type: userConstants.LOGIN_FAILURE, error };
	};

	dispatch(request({ email }));

	try {
		const user = await userService.login(email, password);
		dispatch(success(user.token));
		dispatch({ type: userConstants.GETUSER_SUCCESS, user });
		history.push("/");
	} catch (error) {
		dispatch(failure(error.toString()));
		dispatch(alertActions.error(error.toString()));
	}
};

export { login };
