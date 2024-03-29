const bcrypt = require("bcrypt");
const db = require("../db");
const { promisify } = require("util");
const dbQuery = promisify(db.query.bind(db));

// CLUB MODEL
const Club = function (club) {
    this.clubId = club.clubId;
    this.clubName = club.clubName;
    this.clubEmail = club.clubEmail;
    this.clubImage = club.clubImage;
    this.clubAddress = club.clubAddress;
    this.managerName = club.managerName;
    this.managerImage = club.managerImage;
    this.managerEmail = club.managerEmail;
    this.managerPhone = club.managerPhone;
    this.managerAddress = club.managerAddress;
    this.clubPassword = club.clubPassword;
    this.isActive = club.isActive;
    this.isSuspended = club.isSuspended;
    this.registeredDate = club.registeredDate;
};
//
//
//
// CLUB REGISTRATION
Club.registration = async (newClub) => {
    try {
        const checkEmailQuery =
            "SELECT * FROM Clubs WHERE clubEmail = ? AND isActive=1";

        const errors = {};

        const emailRes = await dbQuery(checkEmailQuery, [
            newClub.clubEmail,
        ]);
        if (emailRes.length > 0) {
            errors["Email"] = ["Email already exists"];
        }

        if (Object.keys(errors).length > 0) {
            throw { name: "ValidationError", errors: errors };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(newClub.clubPassword, 10);
        newClub.clubPassword = hashedPassword;

        const insertQuery = "INSERT INTO Clubs SET ?";
        const insertRes = await dbQuery(insertQuery, newClub);

        return { clubId: insertRes.insertId, ...newClub };
    } catch (error) {
        console.error("Error during club registration in model:", error);
        throw error;
    }
};
//
//
//
//
// CLUB LOGIN
Club.login = async (email, password) => {
    const query =
        "SELECT * FROM Clubs WHERE clubEmail = ? AND isActive = 1";

    try {
        const result = await dbQuery(query, [email]);

        if (result.length === 0) {
            throw new Error("Club not found");
        }

        const club = result[0];

        const isMatch = await promisify(bcrypt.compare)(
            password,
            club.clubPassword
        );

        if (!isMatch) {
            throw new Error("Wrong password");
        }

        return club;
    } catch (error) {
        console.error("Error during club login:", error);
        throw error;
    }
};
//
//
//
//
// CLUB CHANGE PASSWORD
Club.changePassword = async (clubId, oldPassword, newPassword) => {
    const checkClubQuery =
        "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1";

    try {
        const selectRes = await dbQuery(checkClubQuery, [clubId]);
        if (selectRes.length === 0) {
            throw new Error("Club not found");
        }

        const club = selectRes[0];
        const isMatch = await promisify(bcrypt.compare)(
            oldPassword,
            club.clubPassword
        );

        if (!isMatch) {
            throw new Error("Incorrect old password");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `
            UPDATE Clubs
            SET
                clubPassword = ?,
                updateStatus = 1
            WHERE clubId = ? AND isActive = 1
        `;

        const updatePasswordValues = [hashedNewPassword, clubId];

        await dbQuery(updatePasswordQuery, updatePasswordValues);

        console.log(
            "Club password updated successfully for clubId:",
            clubId
        );
        return { message: "Password updated successfully" };
    } catch (error) {
        throw error;
    }
};
//
//
//
//
// CLUB VIEW PROFILE
Club.viewProfile = async (clubId) => {
    const query =
        "SELECT clubId, clubName, clubImage, clubEmail, clubAddress, managerName, managerImage, managerEmail, managerMobile, registeredDate FROM Clubs WHERE clubId = ? AND isActive = 1";

    try {
        const result = await dbQuery(query, [clubId]);

        if (result.length === 0) {
            throw new Error("Club not found");
        }

        return result[0];
    } catch (error) {
        throw error;
    }
};
//
//
//
//
//
// CLUB UPDATE PROFILE
Club.updateProfile = async (updatedClub) => {
    const checkClubQuery =
        "SELECT * FROM Clubs WHERE clubId = ? AND isSuspended = 0 AND isActive = 1";

    try {
        const selectRes = await dbQuery(checkClubQuery, [
            updatedClub.clubId,
        ]);

        if (selectRes.length === 0) {
            throw new Error("Club not found");
        }

        const updateQuery = `
              UPDATE Clubs
              SET
                  updateStatus = 1,
                  isSuspended = 0,
                  isActive = 1,
                  clubName = ?,
                  managerMobile = ?,
                  clubAddress = ?,
                  managerName = ?
              WHERE clubId = ? AND isSuspended = 0 AND isActive = 1
          `;

        await dbQuery(updateQuery, [
            updatedClub.clubName,
            updatedClub.managerMobile,
            updatedClub.clubAddress,
            updatedClub.managerName,
            updatedClub.clubId,
        ]);

        const updatedDetailsRes = await dbQuery(checkClubQuery, [
            updatedClub.clubId,
        ]);

        if (updatedDetailsRes.length === 0) {
            throw new Error("Error fetching updated club details.");
        }

        return updatedDetailsRes[0]; // Return updated club details
    } catch (error) {
        console.error("Error updating club profile:", error);
        throw error;
    }
};
//
//
//
//
// CLUB VIEW ALL UNAPPROVED PLAYERS
Club.viewAllUnapprovedPlayers = async (clubId) => {
    try {
        const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended =0";
        const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);

        if (clubCheckResult.length === 0) {
            throw new Error("Club not found");
        }

        const viewUnapprovedPlayersQuery = `
        SELECT * FROM Players
        WHERE clubId = ? AND isApproved = 0 AND deleteStatus = 0
      `;
        const unapprovedPlayers = await dbQuery(viewUnapprovedPlayersQuery, [clubId]);

        return unapprovedPlayers;
    } catch (error) {
        console.error("Error viewing unapproved players:", error);
        throw error;
    }
};
//
//
//
//
// CLUB VIEW ONE UNAPPROVED PLAYER
Club.viewOneUnapprovedPlayer = async (clubId, playerId) => {
    try {
        const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended =0";
        const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);

        if (clubCheckResult.length === 0) {
            throw new Error("Club not found");
        }

        const viewUnapprovedPlayerQuery = `
        SELECT * FROM Players
        WHERE clubId = ? AND playerId = ? AND isApproved = 0 AND deleteStatus = 0
      `;
        const unapprovedPlayerResult = await dbQuery(viewUnapprovedPlayerQuery, [clubId, playerId]);

        if (unapprovedPlayerResult.length === 0) {
            throw new Error("Unapproved player not found or already approved");
        }

        return unapprovedPlayerResult[0];
    } catch (error) {
        console.error("Error viewing unapproved player:", error);
        throw error;
    }
};
//
//
//
//
// CLUB APPROVE ONE PLAYER
Club.approveOnePlayer = async (clubId, playerId) => {
    try {
        // Validate existence of the club
        const clubCheckQuery = "SELECT * FROM clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
        const clubCheckRes = await dbQuery(clubCheckQuery, [clubId]);
        if (clubCheckRes.length === 0) {
            throw new Error("Club not found");
        }

        // Validate existence and status of the Player
        const playerCheckQuery = "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND isApproved = 0";
        const playerCheckRes = await dbQuery(playerCheckQuery, [playerId, clubId]);
        if (playerCheckRes.length === 0) {
            throw new Error("Player not found or already approved");
        }

        // Approve the Player
        const approveQuery = "UPDATE Players SET isApproved = 1, isActive = 1 WHERE playerId = ? AND clubId = ?";
        await dbQuery(approveQuery, [playerId, clubId]);

        return playerId; // Return the approved playerId
    } catch (error) {
        console.error("Error in approvePlayer model:", error);
        throw error;
    }
};
//
//
//
//
// CLUB VIEW ALL PLAYERS
Club.viewAllPlayers = async (clubId) => {
    try {
        // Check if the club exists and is active
        const checkclubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
        const clubCheckResult = await dbQuery(checkclubQuery, [clubId]);

        if (clubCheckResult.length === 0) {
            throw new Error("club not found");
        }

        // Fetch all players associated with the club
        const viewAllPlayersQuery =
            "SELECT * FROM Players WHERE clubId = ? AND isActive = 1 AND isSuspended = 0 AND deleteStatus = 0 AND isApproved = 1";
        const allPlayers = await dbQuery(viewAllPlayersQuery, [clubId]);

        return allPlayers;
    } catch (error) {
        console.error("Error viewing all players:", error);
        throw error;
    }
};
//
//
//
//
// CLUB VIEW ONE PLAYER
Club.viewOnePlayer = async (clubId, playerId) => {
    try {
      const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const viewPlayerQuery =
        "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND isActive = 1 AND isSuspended = 0 AND deleteStatus = 0 AND isApproved = 1";
      const player = await dbQuery(viewPlayerQuery, [playerId, clubId]);
  

      
  
      return player[0];
    } catch (error) {
      console.error("Error viewing player:", error);
      throw error;
    }
};
//
//
//
//
//
// CLUB DELETE ONE PLAYER
Club.deleteOnePlayer = async (clubId, playerId) => {
    try {
        // Validate existence of the club
        const clubCheckQuery = "SELECT * FROM clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0 ";
        const clubCheckRes = await dbQuery(clubCheckQuery, [clubId]);
        if (clubCheckRes.length === 0) {
            throw new Error("club not found");
        }

        // Validate existence and status of the Player
        const playerCheckQuery = "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND deleteStatus = 0";
        const playerCheckRes = await dbQuery(playerCheckQuery, [playerId, clubId]);
        if (playerCheckRes.length === 0) {
            throw new Error("Player not found or already deleted");
        }

        // Mark the Player as deleted
        const deleteQuery = "UPDATE Players SET deleteStatus = 1 isApproved = 0 WHERE playerId = ? AND clubId = ?";
        await dbQuery(deleteQuery, [playerId, clubId]);

        return playerId; // Return the deleted playerId
    } catch (error) {
        console.error("Error deleting Player:", error);
        throw error;
    }
};
//
//
//
//
// CLUB SEARCH PLAYERS
Club.searchPlayers = async (clubId, searchQuery) => {
    try {
      // First, check if the club is active and not deleted
      const checkClubQuery = `
        SELECT * FROM Clubs 
        WHERE clubId = ? 
          AND isActive = 1 
          AND isSuspended = 0
      `;
  
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found or not active");
      }
  
      const query = `
        SELECT 
          playerId, 
          clubId,
          playerName, 
          playerEmail, 
          playerMobile, 
          playerImage, 
          playerAge, 
          playerCountry, 
          playerPosition, 
          playerAddress
        FROM Players 
        WHERE clubId = ? 
          AND (
            playerId LIKE ? OR
            playerName LIKE ? OR
            playerEmail LIKE ? OR
            playerMobile LIKE ? OR
            playerAddress LIKE ?
          )
      `;
  
      const searchParams = [
        clubId,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`
      ];
  
      const result = await dbQuery(query, searchParams);
  
      if (result.length === 0) {
        throw new Error("No players found matching the criteria");
      }
  
      return result;
    } catch (error) {
      console.error("Error searching players:", error);
      throw error;
    }
};
//
//
//
//
//
// CLUB SUSPEND PLAYER
Club.suspendOnePlayer = async (playerId, clubId) => {
    try {
      // Validate existence of the club
      const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      // Validate existence and active status of the player
      const checkPlayerQuery = "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND isActive = 1 AND deleteStatus = 0 AND isSuspended = 0";
      const playerCheckResult = await dbQuery(checkPlayerQuery, [playerId, clubId]);
      if (playerCheckResult.length === 0) {
        throw new Error("Player not found or already suspended");
      }
  
      // Suspend the player
      const suspendQuery = "UPDATE Players SET isSuspended = 1, isActive = 0 WHERE playerId = ? AND clubId = ?";
      await dbQuery(suspendQuery, [playerId, clubId]);
  
      return true; // Indicates successful suspension
    } catch (error) {
      console.error("Error suspending player:", error);
      throw error;
    }
};
//
//
//
//
//
//
// CLUB UNSUSPEND PLAYER
Club.unsuspendOnePlayer = async (playerId, clubId) => {
    try {
      // Validate existence of the club
      const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      // Validate existence and suspended status of the player
      const checkPlayerQuery = "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND isActive = 1 AND deleteStatus = 0 AND isSuspended = 1";
      const playerCheckResult = await dbQuery(checkPlayerQuery, [playerId, clubId]);
      if (playerCheckResult.length === 0) {
        throw new Error("Player not found or not suspended");
      }
  
      // Unsuspend the player
      const unsuspendQuery = "UPDATE Players SET isSuspended = 0, isActive = 1 WHERE playerId = ? AND clubId = ?";
      await dbQuery(unsuspendQuery, [playerId, clubId]);
  
      return true; // Indicates successful unsuspension
    } catch (error) {
      console.error("Error unsuspending player:", error);
      throw error;
    }
};
//
//
//
//
//
// CLUB VIEW ALL SUSPENDED PLAYERS
Club.viewAllSuspendedPlayers = async (clubId) => {
    try {
      const checkClubQuery =
        "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const viewSuspendedPlayersQuery =
        "SELECT * FROM Players WHERE clubId = ? AND isSuspended = 1";
      const suspendedPlayers = await dbQuery(viewSuspendedPlayersQuery, [clubId]);
  
      return suspendedPlayers;
    } catch (error) {
      console.error("Error viewing all suspended players:", error);
      throw error;
    }
};
//
//
//
//
//
// CLUB VIEW ONE SUSPENED PLAYER
Club.viewOneSuspendedPlayer = async (playerId, clubId) => {
    try {
      const checkClubQuery =
        "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const viewOneSuspendedPlayerQuery =
        "SELECT * FROM Players WHERE playerId = ? AND clubId = ? AND isSuspended = 1";
      const suspendedPlayerDetails = await dbQuery(viewOneSuspendedPlayerQuery, [
        playerId,
        clubId,
      ]);
  
      if (suspendedPlayerDetails.length === 0) {
        throw new Error("Suspended player not found");
      }
  
      return suspendedPlayerDetails[0]; // Returning the suspended player details directly
    } catch (error) {
      console.error("Error viewing suspended player:", error);
      throw error;
    }
};
//
//
//
//
//
// CLUB SEND NOTIFICATION TO PLAYER
Club.sendNotificationToPlayer = async (clubId, playerId, message) => {
    try {
      // Check if the club exists and is active
      const checkClubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      // Check if the player exists and is active
      const checkPlayerQuery = "SELECT * FROM Players WHERE playerId = ? AND isActive = 1 AND deleteStatus = 0";
      const playerCheckResult = await dbQuery(checkPlayerQuery, [playerId]);
      if (playerCheckResult.length === 0) {
        throw new Error("Player not found or not active");
      }
  
      // Insert the notification into the database
      const insertNotificationQuery = "INSERT INTO Notification_To_Players (clubId, playerId, message) VALUES (?, ?, ?)";
      const result = await dbQuery(insertNotificationQuery, [clubId, playerId, message]);
  
      // Retrieve the inserted notification ID
      const notificationId = result.insertId;
  
      // Construct the notification details object
      const notificationDetails = {
        notificationId: notificationId,
        clubId: clubId,
        playerId: playerId,
        message: message,
      };
  
      return notificationDetails;
    } catch (error) {
      console.error("Error sending notification to player:", error);
      throw error;
    }
};
//
//
//
//
// CLUB ADD ONE INJURY UPDATE
Club.addOneInjuryUpdate = async (playerId, clubId, injuryData) => {
    try {
        const clubQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isActive = 1 AND isSuspended = 0";
        const clubResult = await dbQuery(clubQuery, [clubId]);
        if (!clubResult || clubResult.length === 0) {
            throw new Error('Club not found');
        }

        const club = clubResult[0];
        const clubName = club.clubName;

        const playerQuery = "SELECT * FROM Players WHERE playerId = ? AND clubId = ?";
        const playerResult = await dbQuery(playerQuery, [playerId, clubId]);
        if (!playerResult || playerResult.length === 0) {
            throw new Error('Player not found or not associated with the specified club');
        }


        const player = playerResult[0];
        const playerName = player.playerName;
        const playerImage = player.playerImage;



        const insertInjuryQuery = `
            INSERT INTO Injuries (playerId, clubId, playerName, playerImage, clubName, injuryType, averageRecoveryTime)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertInjuryValues = [
            playerId,
            clubId,
            playerName,
            playerImage,
            clubName,
            injuryData.injuryType,
            injuryData.averageRecoveryTime,
        ];

        await dbQuery(insertInjuryQuery, insertInjuryValues);

        return {
            playerId,
            clubId,
            ...injuryData
        };
    } catch (error) {
        console.error('Error in addOneInjuryUpdate:', error.message);
        throw new Error('Error submitting injury details by club: ' + error.message);
    }
};
//
//
//
//
// CLUB VIEW ALL LEAVE REQUESTS
Club.viewAllLeaveRequests = async (clubId) => {
    try {
        // Fetch club details
        const clubQuery = `
            SELECT *
            FROM Clubs
            WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
        `;
        const clubQueryResult = await dbQuery(clubQuery, [clubId]);

        if (clubQueryResult.length === 0) {
            throw new Error("club not found");
        }

        // Fetch all notifications for the patient
        const viewAllleaveRequestsQuery = `
            SELECT *
            FROM Leave_Request_To_Club
            WHERE clubId = ? AND isSuccess = 1 AND isApproved = 0
        `;
        const allLeaveRequests = await dbQuery(viewAllleaveRequestsQuery, [clubId]);

        // Check if there are no leave requests found
        if (allLeaveRequests.length === 0) {
            throw new Error("No successful leave requests found for this club");
        }

        return allLeaveRequests; // Return leave requests
    } catch (error) {
        console.error("Error viewing all leave requests for player:", error);
        throw error;
    }
};
//
//
//
//
//
// CLUB VIEW ONE LEAVE REQUEST
Club.viewOneLeaveRequest = async (leaveRequestId, clubId) => {
    try {
        // Fetch club details to ensure the club exists and is active
        const clubQuery = `
            SELECT *
            FROM Clubs
            WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
        `;
        const clubQueryResult = await dbQuery(clubQuery, [clubId]);

        if (clubQueryResult.length === 0) {
            throw new Error("Club not found or inactive");
        }

        // Fetch the leave request using leaveRequestId and clubId
        const viewOneLeaveRequestQuery = `
            SELECT *
            FROM Leave_Request_To_Club
            WHERE leaveRequestId = ? AND clubId = ? AND isSuccess = 1 AND isApproved = 0
        `;
        const leaveRequest = await dbQuery(viewOneLeaveRequestQuery, [leaveRequestId, clubId]);

        // Check if the leave request exists
        if (leaveRequest.length === 0) {
            throw new Error("Leave request not found or not eligible for viewing");
        }

        return leaveRequest[0]; // Return the leave request
    } catch (error) {
        console.error("Error viewing leave request:", error);
        throw error;
    }
};
//
//
//
//
// CLUB APPROVE ONE LEAVE REQUEST
Club.approveOneLeaveRequest = async (leaveRequestId, clubId) => {
    try {
        // Fetch club details to ensure the club exists and is active
        const clubQuery = `
            SELECT *
            FROM Clubs
            WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
        `;
        const clubQueryResult = await dbQuery(clubQuery, [clubId]);

        if (clubQueryResult.length === 0) {
            throw new Error("Club not found or inactive");
        }

        // Fetch the leave request using leaveRequestId and clubId
        const viewOneLeaveRequestQuery = `
            SELECT *
            FROM Leave_Request_To_Club
            WHERE leaveRequestId = ? AND clubId = ? AND isSuccess = 1 AND isApproved = 0
        `;
        const leaveRequest = await dbQuery(viewOneLeaveRequestQuery, [leaveRequestId, clubId]);

        // Check if the leave request exists
        if (leaveRequest.length === 0) {
            throw new Error("Leave request not found or not eligible for approval");
        }

        // Update the leave request to mark it as approved
        const approveLeaveRequestQuery = `
            UPDATE Leave_Request_To_Club
            SET isApproved = 1
            WHERE leaveRequestId = ? AND clubId = ?
        `;
        await dbQuery(approveLeaveRequestQuery, [leaveRequestId, clubId]);

        return leaveRequestId; // Return the approved leave request ID
    } catch (error) {
        console.error("Error approving leave request:", error);
        throw error;
    }
};
//
//
//
//
//
// CLUB VIEW ALL MATCHES
Club.viewAllMatches = async (clubId) => {
    try {
      const checkClubQuery = `
              SELECT clubId
              FROM Clubs
              WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
          `;
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const viewAllMatchQuery = `
              SELECT * FROM Matches
              WHERE deleteStatus = 0 AND endStatus = 0 
              ORDER BY matchDate DESC
          `;
      const allMatches = await dbQuery(viewAllMatchQuery);
  
      return allMatches;
    } catch (error) {
      console.error("Error viewing all football matches:", error);
      throw error;
    }
  };
//
//
//
//
//
// CLUB VIEW ONE MATCH
Club.viewOneMatch = async (matchId, clubId) => {
    try {
      const verifyClubQuery = `
              SELECT clubId
              FROM Clubs
              WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
          `;
      const clubResult = await dbQuery(verifyClubQuery, [clubId]);
  
      if (clubResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const query = `
              SELECT * FROM Matches
              WHERE matchId = ? AND deleteStatus = 0  AND endStatus = 0 
          `;
      const result = await dbQuery(query, [matchId]);
  
      if (result.length === 0) {
        throw new Error("Match not found");
      }
  
      return result[0];
    } catch (error) {
      console.error("Error fetching football match:", error);
      throw error;
    }
  };
//
//
//
//
// CLUB VIEW ALL MATCH POINTS
Club.viewAllMatchPoints = async (clubId) => {
    try {
      const clubExistsQuery = "SELECT * FROM Clubs WHERE clubId = ? AND isSuspended = 0 AND isActive = 1";
      const clubExistsResult = await dbQuery(clubExistsQuery, [clubId]);
  
      if (clubExistsResult.length === 0) {
        throw new Error("Club not found");
      }
  
      const query = `SELECT * FROM Matches ORDER BY matchDate ASC`;
  
      const matchPoints = await dbQuery(query);
  
      return matchPoints;
    } catch (error) {
      console.error("Error viewing all match points:", error);
      throw error;
    }
  };
  
//
//
//
//
//
// CLUB VIEW ALL NEWS
Club.viewAllNews = async (clubId) => {
    try {
      const checkClubQuery = `
              SELECT clubId
              FROM Clubs
              WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
          `;
      const clubCheckResult = await dbQuery(checkClubQuery, [clubId]);
  
      if (clubCheckResult.length === 0) {
        throw new Error("Club not found, inactive, or suspended");
      }
  
      const viewAllNewsQuery = `
              SELECT * FROM FootballNews
              WHERE deleteStatus = 0
              ORDER BY addedDate DESC
          `;
      const allNews = await dbQuery(viewAllNewsQuery);
  
      return allNews;
    } catch (error) {
      console.error("Error viewing all football news:", error);
      throw error;
    }
  };
//
//
//
//
//
// CLUB VIEW ONE NEWS
Club.viewOneNews = async (footballNewsId, clubId) => {
    try {
      const verifyClubQuery = `
              SELECT clubId
              FROM Clubs
              WHERE clubId = ? AND isActive = 1 AND isSuspended = 0
          `;
      const clubResult = await dbQuery(verifyClubQuery, [clubId]);
  
      if (clubResult.length === 0) {
        throw new Error("Club not found or suspended");
      }
  
      const query = `
              SELECT * FROM FootballNews
              WHERE footballNewsId = ? AND deleteStatus = 0
          `;
      const result = await dbQuery(query, [footballNewsId]);
  
      if (result.length === 0) {
        throw new Error("Football news not found");
      }
  
      return result[0];
    } catch (error) {
      console.error("Error fetching football news:", error);
      throw error;
    }
  };
//
//
//
//
//
// CLUB VIEW ALL CLUBS
Club.viewAllClubs = async () => {
    try {
        const viewAllClubsQuery = `
        SELECT *
        FROM Clubs
        WHERE isActive = 1 AND isSuspended = 0
      `;
        const allClubs = await dbQuery(viewAllClubsQuery);

        if (allClubs.length === 0) {
            throw new Error("No clubs found");
        }

        return allClubs;
    } catch (error) {
        throw error;
    }
};
  
  
  



module.exports = { Club };