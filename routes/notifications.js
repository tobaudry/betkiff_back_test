const express = require("express");
const {
  sendNotificationToUser,
  sendNotificationToOrganization,
} = require("../controllers/notificationsController");

const router = express.Router();

router.post("/sendToUser", sendNotificationToUser);
router.post("/sendToOrganisation", sendNotificationToOrganization);

module.exports = router;
