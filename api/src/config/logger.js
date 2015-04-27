var config = require('./index'),
    winston = require('winston');

winston.emitErrs = true;

/*
 * workaround to send out to multiple log files
 * see http://stackoverflow.com/questions/10045891/multiple-log-files-with-winston
 */
var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: 'file#info',
      level: 'info',
      filename: 'info.log',
      handleExceptions: true,
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.File({
      name: 'file#debug',
      level: 'debug',
      filename: 'debug.log',
      handleExceptions: true,
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 1,
      colorize: false
    }),
   new winston.transports.File({
      name: 'file#error',
      level: 'warn',
      filename: 'error.log',
      handleExceptions: true,
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'error',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

/**
 *
 * @type {winston.Logger}
 */
module.exports = logger;

/**
 *
 * @type {{write: Function}}
 */
module.exports.stream = {
  /**
   * Writes out to the logger.
   *
   * Chomps the eol, see http://stackoverflow.com/questions/9141358/how-do-i-output-connect-expresss-logger-output-to-winston
   *
   * @param {String} message
   * @param encoding
   */
  write: function (message, encoding) {
    logger.info(message.slice(0, -1));
  }
};