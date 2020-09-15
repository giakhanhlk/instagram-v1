const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.getMessagesForRoom = (req, res, next) => {
	const schema = Joi.object({
		_id: Joi.objectId().require(),
		initialFetch: Joi.boolean().required(),
		lastId: Joi.when("initialFetch", {
			is: false,
			then: Joi.objectId().require(),
			otherwise: Joi.forbidden(),
		}),
	});

	const { _id, lastId, initialFetch } = req.body;
	const { error } = schema.validate({ _id, lastId, initialFetch });
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};

exports.sendMessage = (req, res, next) => {
	const schema = Joi.object({
		roomId: Joi.objectId().require(),
		value: Joi.string().min(1).max(500).require(),
		receiver: Joi.objectId().require(),
	});

	const {
		roomId,
		value,
		receiver: { _id },
	} = req.body;

	const { error } = schema.validate({ roomId, value, receiver: _id });
	if (error) {
		return res.status(400).json({ message: error.message });
	}
};

exports.readMessages = (req, res, next) => {
	const schema = Joi.object({
		roomId: Joi.objectId().required(),
		messageIds: Joi.array().required(),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};

exports.sendImage = (req, res, next) => {
	const schema = Joi.object({
		roomId: Joi.objectId().required(),
		uuid: Joi.string().guid().required(),
		receiver: Joi.objectId().required(),
	});
	const { roomId, uuid, receiver } = req.body;
	const { error } = schema.validate({
		roomId,
		uuid,
		receiver: JSON.parse(receiver)._id,
	});
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};

exports.handleCall = (req, res, next) => {
	const schema = Joi.object({
		roomId: Joi.objectId().required(),
		currentRoom: Joi.objectId().required(),
	});
	const {
		roomId,
		currentRoom: { _id },
	} = req.body;
	const { error } = schema.validate({
		roomId,
		currentRoom: _id,
	});
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};

exports.answer = (req, res, next) => {
	const schema = Joi.object({
		roomId: Joi.objectId().required(),
	});
	const { roomId } = req.body;
	const { error } = schema.validate({
		roomId,
	});
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};
