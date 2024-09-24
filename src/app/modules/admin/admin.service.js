const config = require("../../../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../../errors/ApiError");
const { jwtHelpers } = require("../../../helpers/jwtHelpers");
const User = require("../auth/auth.model");
const Admin = require("./admin.model");
const httpStatus = require("http-status");
const { sendEmail } = require("../../../utils/sendEmail");
const { logger } = require("../../../shared/logger");
const mongoose = require("mongoose");
const {
  registrationSuccess,
} = require("../../../mails/email.registrationSuccess");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { sendResetEmail } = require("../../../utils/sendResetMails");
const { ObjectId } = mongoose.Types;

// Registration for Admin
const registrationUser = async (payload) => {
  const { name, email, password } = payload;

  const user = { name, email, password };
  const isEmailExist = await Admin.findOne({ email });
  if (isEmailExist) {
    throw new ApiError(400, "Email already exist");
  }
  const newUser = await Admin.create(payload);
  const data = { user: { name: user.name } };

  sendEmail({
    email: user.email,
    subject: "Congratulations to register successfully",
    html: registrationSuccess(data),
  }).catch((error) => {
    logger.error("Failed to send email:", error);
  });

  const { password: omit, ...userWithoutPassword } = newUser.toObject();

  return userWithoutPassword;
};
 

// Get All Admins
const getAllAdmin = async () => {
  const results = await Admin.find({}).lean();
  return results;
};

// Update Admin
const updateAdmin = async (id, req) => {
  const { files } = req;

  let profile_image = undefined;

  if (files && files.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  const data = req.body;
  if (!data) {
    throw new Error("Data is missing in the request body!");
  }

  const isExist = await Admin.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(404, "Admin not found !");
  }

  const updatedAdminData = { ...data };

  const result = await Admin.findOneAndUpdate(
    { _id: id },
    { profile_image, ...updatedAdminData },
    {
      new: true,
    }
  );
  return result;
};

// Login
const login = async (payload) => {
  const { email, password } = payload;

  const isUserExist = await Admin.isAdminExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "Admin does not exist");
  }

  if (
    isUserExist.password &&
    !(await Admin.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }

  const { _id: userId, role } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret,
    config.jwt.expires_in
  );
  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    accessToken,
    refreshToken,
  };
};

// Refresh Token
const refreshToken = async (token) => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(token, config.jwt.refresh_secret);
  } catch (err) {
    throw new ApiError(402, "Invalid Refresh Token");
  }

  const { userId } = verifiedToken;

  const isUserExist = await Admin.isAdminExist(userId);
  if (!isUserExist) {
    throw new ApiError(403, "Admin does not exist");
  }

  const newAccessToken = jwtHelpers.createToken(
    {
      id: isUserExist._id,
      role: isUserExist.role,
    },
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    accessToken: newAccessToken,
  };
};

// Change Password
const changePassword = async (user, payload) => {
  const { oldPassword, newPassword } = payload;

  const isAdminExist = await Admin.findOne({ _id: user.userId }).select(
    "+password"
  );

  if (!isAdminExist) {
    throw new ApiError(404, "Admin does not exist");
  }
  if (
    isAdminExist.password &&
    !(await Admin.isPasswordMatched(oldPassword, isAdminExist.password))
  ) {
    throw new ApiError(402, "Old password is incorrect");
  }
  isAdminExist.password = newPassword;
  await isAdminExist.save();
};

const forgotPass = async (payload) => {
  const admin = await Admin.findOne(
    { email: payload.email },
    { _id: 1, role: 1 }
  );

  if (!admin) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin does not exist!");
  }

  let profile = null;
  if (
    admin.role === ENUM_USER_ROLE.ADMIN ||
    admin.role === ENUM_USER_ROLE.SUPER_ADMIN
  ) {
    profile = await Admin.findOne({ _id: admin._id });
  }

  if (!profile) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Profile not found!");
  }

  if (!profile.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
  admin.verifyCode = activationCode;
  admin.verifyExpire = expiryTime;
  await admin.save();

  sendResetEmail(
    profile.email,
    `
        <div>
          <p>Hi, ${profile.name}</p>
          <p>Your password reset code: ${activationCode}</p>
          <p>Thank you</p>
        </div>
      `
  );
};

const forgetActivationCode = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return activationCode;
};

const checkIsValidForgetActivationCode = async (payload) => {
  const admin = await Admin.findOne({ email: payload.email });

  if (!admin) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin does not exist!");
  }

  if (admin.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset code!");
  }

  const currentTime = new Date();
  if (currentTime > admin.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reset code has expired!");
  }

  const result = await Admin.updateOne(
    { email: payload.email },
    { $set: { valid: true } },
    { upsert: true }
  );

  return { valid: true };
};

const resetPassword = async (payload) => {
  const { email, newPassword, confirmPassword } = payload;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords don't match");
  }

  const admin = await Admin.findOne({ email }, { _id: 1 });

  if (!admin) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Admin not found!");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await Admin.updateOne({ email }, { password: hashedPassword });
  admin.verifyCode = null;
  admin.verifyExpire = null;
  await admin.save();
};

const myProfile = async (req) => {
  const { userId } = req.user;
  const result = await Admin.findById(userId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Profile not found");
  }
  return result;
};

const deleteAdmin = async (id) => {
  const result = await Admin.findByIdAndDelete(id);
  return result;
};

const AdminService = {
  registrationUser,
  // createUser,
  getAllAdmin,
  updateAdmin,
  login,
  refreshToken,
  changePassword,
  forgotPass,
  forgetActivationCode,
  checkIsValidForgetActivationCode,
  resetPassword,
  myProfile,
  deleteAdmin,
};

module.exports = { AdminService };
