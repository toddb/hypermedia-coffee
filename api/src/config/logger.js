var config = require('./index'),
    winston = require('winston');

winston.emitErrs = true;

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: 'all-logs.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'debug',
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
   * @param {String} message
   * @param encoding
   */
  write: function (message, encoding) {
    logger.info(message);
  }
};