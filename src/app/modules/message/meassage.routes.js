const express = require("express");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums"); 
const MessageValidation = require("./messages.validation");
const validateRequest = require("../../middlewares/validateRequest");

const router = express.Router();

// router.post(
//     '/send-message/:id',
//     auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DRIVER),
//     validateRequest(MessageValidation.messages),
//     messageController.sendMessage,
//   );

//   router.get(
//     '/get-conversation',
//     auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DRIVER),
//     messageController.conversationUser,
//   );

//   router.get(
//     '/get-message',
//     auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DRIVER),
//     messageController.getMessages,
//   );

module.exports = router;
