const bcrypt = require("bcrypt");
const db = require("../db");
const { promisify } = require("util");
const dbQuery = promisify(db.query.bind(db));

// ADMIN MODEL
const Admin = function (admin) {
  this.adminId = admin.adminId;
  this.adminName = admin.adminName;
  this.adminEmail = admin.adminEmail;
  this.adminImage = admin.adminImage;
  this.adminPassword = admin.adminPassword;
  this.registeredDate = admin.registeredDate;
  this.updatedDate = admin.updatedDate;
  this.isActive = admin.isActive;
  this.deleteStatus = admin.deleteStatus;
  this.updateStatus = admin.updateStatus;
  this.passwordUpdatedStatus = admin.passwordUpdatedStatus;
};
//
//
//
//
// ADMIN REGISTER
Admin.registration = async (newAdmin) => {
  try {
    const checkEmailQuery =
      "SELECT * FROM Admins WHERE adminEmail = ? AND deleteStatus=0 AND isActive=1";

    const errors = {};

    const emailRes = await dbQuery(checkEmailQuery, [
      newAdmin.adminEmail,
    ]);
    if (emailRes.length > 0) {
      errors["Email"] = ["Email already exists"];
    }

    if (Object.keys(errors).length > 0) {
      throw { name: "ValidationError", errors: errors };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(newAdmin.adminPassword, 10);
    newAdmin.adminPassword = hashedPassword;

    const insertQuery = "INSERT INTO Admins SET ?";
    const insertRes = await dbQuery(insertQuery, newAdmin);

    return { adminId: insertRes.insertId, ...newAdmin };
  } catch (error) {
    console.error("Error during admin registration in model:", error);
    throw error;
  }
};
//
//
//
//
// ADMIN LOGIN
Admin.login = async (email, password) => {
  const query =
    "SELECT * FROM Admins WHERE adminEmail = ? AND isActive = 1 AND deleteStatus = 0";

  try {
    const result = await dbQuery(query, [email]);

    if (result.length === 0) {
      throw new Error("Admin not found");
    }

    const admin = result[0];

    const isMatch = await promisify(bcrypt.compare)(
      password,
      admin.adminPassword
    );

    if (!isMatch) {
      throw new Error("Wrong password");
    }

    return admin;
  } catch (error) {
    console.error("Error during admin login:", error);
    throw error;
  }
};
//
//
//
//
// ADMIN CHANGE PASSWORD
Admin.changePassword = async (adminId, oldPassword, newPassword) => {
  const checkAdminQuery =
    "SELECT * FROM Admins WHERE adminId = ? AND deleteStatus = 0 AND isActive = 1";

  try {
    const selectRes = await dbQuery(checkAdminQuery, [adminId]);
    if (selectRes.length === 0) {
      throw new Error("Admin not found");
    }

    const admin = selectRes[0];
    const isMatch = await promisify(bcrypt.compare)(
      oldPassword,
      admin.adminPassword
    );

    if (!isMatch) {
      throw new Error("Incorrect old password");
    }

    const hashedNewPassword = await promisify(bcrypt.hash)(newPassword, 10);
    const updatePasswordQuery = `
            UPDATE Admins
            SET
                updateStatus = 1,
                updatedDate = CURRENT_DATE(),
                deleteStatus = 0,
                isActive = 1,
                adminPassword = ?,
                passwordUpdatedStatus = 1
            WHERE adminId = ? AND deleteStatus = 0 AND isActive = 1
        `;

    const updatePasswordValues = [hashedNewPassword, adminId];

    await dbQuery(updatePasswordQuery, updatePasswordValues);

    console.log(
      "Admin password updated successfully for adminId:",
      adminId
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
// ADMIN VIEW PROFILE
Admin.viewProfile = async (adminId) => {
  const query =
    "SELECT adminId, adminName, adminImage, adminEmail, adminAadhar, adminMobile, adminAddress, registeredDate FROM Admins WHERE adminId = ? AND deleteStatus = 0 AND isActive = 1";

  try {
    const result = await dbQuery(query, [adminId]);

    if (result.length === 0) {
      throw new Error("Admin not found");
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
// ADMIN UPDATE PROFILE
Admin.updateProfile = async (updatedAdmin) => {
  const checkAdminQuery =
    "SELECT * FROM Admins WHERE adminId = ? AND deleteStatus = 0 AND isActive = 1";

  try {
    const selectRes = await dbQuery(checkAdminQuery, [
      updatedAdmin.adminId,
    ]);

    if (selectRes.length === 0) {
      throw new Error("Admin not found");
    }

    const checkAadharQuery =
      "SELECT * FROM Admins WHERE adminAadhar = ? AND adminId != ? AND deleteStatus = 0 AND isActive = 1";
    const aadharRes = await dbQuery(checkAadharQuery, [
      updatedAdmin.adminAadhar,
      updatedAdmin.adminId,
    ]);

    if (aadharRes.length > 0) {
      throw new Error("Aadhar Number Already Exists.");
    }

    const updateQuery = `
            UPDATE Admins
            SET
                updateStatus = 1,
                deleteStatus = 0,
                isActive = 1,
                adminName = ?,
                adminAadhar = ?,
                adminMobile = ?,
                adminAddress = ?
            WHERE adminId = ? AND deleteStatus = 0 AND isActive = 1
        `;

    await dbQuery(updateQuery, [
      updatedAdmin.adminName,
      updatedAdmin.adminAadhar,
      updatedAdmin.adminMobile,
      updatedAdmin.adminAddress,
      updatedAdmin.adminId,
    ]);

    const updatedDetailsRes = await dbQuery(checkAdminQuery, [
      updatedAdmin.adminId,
    ]);

    if (updatedDetailsRes.length === 0) {
      throw new Error("Error fetching updated admin details.");
    }

    return updatedDetailsRes[0]; // Return updated admin details
  } catch (error) {
    console.error("Error updating admin profile:", error);
    throw error;
  }
};
//
//
//
//
// 
Admin.addNews = async (adminId, newFootballNews) => {
  try {
    const checkAdminQuery =
      "SELECT * FROM Admins WHERE adminId = ? AND isActive = 1 AND deleteStatus = 0";
    const checkAdminRes = await dbQuery(checkAdminQuery, [adminId]);

    if (checkAdminRes.length === 0) {
      throw new Error("Admin not found");
    }

    newFootballNews.adminId = adminId;
    const insertQuery = "INSERT INTO FootballNews SET ?";
    const insertRes = await dbQuery(insertQuery, newFootballNews);

    return insertRes.insertId;
  } catch (error) {
    console.error("Error adding football news:", error);
    throw error;
  }
};
//
//
//
//
// 





module.exports = { Admin };
