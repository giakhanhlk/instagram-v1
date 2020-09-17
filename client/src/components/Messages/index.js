import React from "react";
import { Message } from "semantic-ui-react";

const Messages = ({ alert }) => {
	const { type, message } = alert;
	console.log(type, message);
	if (type === "Success") {
		return (
			<Message positive>
				<Message.Header>{message}</Message.Header>
			</Message>
		);
	} else if (type === "Error") {
		return (
			<Message negative>
				<Message.Header>{message}</Message.Header>
			</Message>
		);
	}
	return null;
};

export default Messages;
