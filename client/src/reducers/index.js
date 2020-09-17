import { combineReducers } from "redux";
import { userConstants } from "../_constants/userConstants";
import userReducer from "./userReducer";
import alertReducer from "./alertReducer";
import authenticationReducer from "./authenticationReducer";

const appReducer = combineReducers({
	user: userReducer,
	authentication: authenticationReducer,
	alert: alertReducer,
});

const rootReducer = (state, action) => {
	if (action.type === userConstants.LOGOUT) {
		state = undefined;
	}

	return appReducer(state, action);
};

export default rootReducer;
