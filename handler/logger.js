const Logger = require("@ptkdev/logger");

const options = {
	language: "en",
	colors: true,
	debug: true,
	info: true,
	warning: true,
	error: true,
	sponsor: true,
	write: true,
	type: "log",
	rotate: {
		size: "10M",
		encoding: "utf8",
	},
	path: {
		debug_log: "./logs/debug.log",
		error_log: "./logs/errors.log",
	},
};

const logger = new Logger(options);

module.exports = logger;