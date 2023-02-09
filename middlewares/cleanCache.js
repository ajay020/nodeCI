const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next(); // wait for next middleware funciton complete
  clearHash(req.user.id);
};
