import { alertConstants } from "../_constants/alertConstants";

const initialState = {};

const alert = (state = initialState, action) => {
	switch (action.type) {
		case alertConstants.SUCCESS:
			return {
				type: "Success",
				message: action.message,
			};
		case alertConstants.ERROR:
			return {
				type: "Error",
				message: action.message,
			};
		case alertConstants.CLEAR:
			return {};
		default:
			return state;
	}
};

export default alert;
