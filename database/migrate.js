const { sequelize } = require("../database/db");

require("../models/Rider");
require("../models/Order");
require("../models/Finance");
require("../models/Issue");
require("../models/Notification");

(async () => {

  await sequelize.sync({ alter: true });

  console.log("Database tables created");

  process.exit();

})();