//player.routes.js
const express = require('express');
const router = express.Router();
const PlayerController = require('../../controllers/PlayerControllers/player.controller');


router.post("/playerRegistration", PlayerController.registration);
router.post("/playerLogin", PlayerController.login);
router.post("/playerViewAllClubs", PlayerController.viewAllClubs);
router.post("/playerChangePassword", PlayerController.changePassword);
router.post("/playerViewProfile", PlayerController.viewProfile);
router.post("/playerUpdateProfile", PlayerController.updateProfile);
router.post("/playerViewAllNotifications", PlayerController.viewAllNotifications);
router.post("/playerViewOneNotification", PlayerController.viewOneNotification);
router.post("/playerSendLeaveRequestToClub", PlayerController.sendLeaveRequestToClub);
router.post("/playerViewAllApprovedLeaveRequests", PlayerController.viewAllApprovedLeaveRequests);
router.post("/playerViewAllMatches", PlayerController.viewAllMatches);
router.post("/playerViewOneMatch", PlayerController.viewOneMatch);
router.post("/playerViewAllMatchPoints", PlayerController.viewAllMatchPoints);
router.post("/playerViewAllNews", PlayerController.viewAllNews);
router.post("/playerViewOneNews", PlayerController.viewOneNews);
router.post("/playerViewAllClubs", PlayerController.viewAllClubs);



module.exports = router;