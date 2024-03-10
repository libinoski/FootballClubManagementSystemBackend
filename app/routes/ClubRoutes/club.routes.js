
//club.routes.js
const express = require('express');
const router = express.Router();
const ClubController = require('../../controllers/ClubControllers/club.controller');


router.post("/clubRegistration", ClubController.registration);
router.post("/clubLogin", ClubController.login);
router.post("/clubChangePassword", ClubController.changePassword);
router.post("/clubViewProfile", ClubController.viewProfile);
router.post("/clubUpdateProfile", ClubController.updateProfile);
router.post("/clubViewAllUnapprovedPlayers", ClubController.viewAllUnapprovedPlayers);
router.post("/clubViewOneUnapprovedPlayer", ClubController.viewOneUnapprovedPlayer);
router.post("/clubApproveOnePlayer", ClubController.approveOnePlayer);
router.post("/clubViewAllPlayers", ClubController.viewAllPlayers);
router.post("/clubViewOnePlayer", ClubController.viewOnePlayer);
router.post("/clubDeleteOnePlayer", ClubController.deleteOnePlayer);
router.post("/clubSuspendOnePlayer", ClubController.suspendOnePlayer);
router.post("/clubUnSuspendOnePlayer", ClubController.unSuspendOnePlayer);
router.post("/clubViewAllSuspendedPlayers", ClubController.viewAllSuspendedPlayers);
router.post("/clubViewOneSuspendedPlayer", ClubController.viewOneSuspendedPlayer);
router.post("/clubSendNotificationToPlayer", ClubController.sendNotificationToPlayer);





module.exports = router;