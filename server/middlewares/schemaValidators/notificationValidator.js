const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

exports.readNotifications = (req, res, next) => {
	const validateObject = Object.assign({}, req.body);
	validateObject.notificationIds = JSON.parse(validateObject.notificationIds);

	const schema = Joi.object({
		notificationIds: Joi.array().required(),
	});

	const { error } = schema.validate(validateObject);
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};

exports.getNotifications = (req, res, next) => {
	const schema = Joi.object({
		initialFetch: Joi.boolean().required(),
		lastId: Joi.when("initialFetch", {
			is: false,
			then: Joi.objectId().required(),
			otherwise: Joi.forbidden(),
		}),
	});

	const { error } = schema.validate(req.body);
	if (error) {
		return res.status(400).json({ message: error.message });
	}
	next();
};
