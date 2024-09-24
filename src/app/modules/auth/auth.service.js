const bcrypt = require("bcrypt");
const ApiError = require("../../../errors/ApiError");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const { jwtHelpers } = require("../../../helpers/jwtHelpers");
const httpStatus = require("http-status");
const { sendEmail } = require("../../../utils/sendEmail");
const {
  registrationSuccessEmailBody,
} = require("../../../mails/email.register");
const { ENUM_USER_ROLE } = require("../../../utils/enums");
const { sendResetEmail } = require("../../../utils/sendResetMails");
const { logger } = require("../../../shared/logger");
const { assign } = require("nodemailer/lib/shared");
const Auth = require("./auth.model");
const User = require("../user/user.model");
const Admin = require("../admin/admin.model");


// Create activation token -done
const createActivationToken = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return { activationCode };
};

// Registration - done
const registrationAccount = async (payload) => {
  const { gender, role, email, password, confirmPassword, ...other } = payload;

  if (!role || !Object.values(ENUM_USER_ROLE).includes(role)) {
    throw new ApiError(400, "Valid Role is required!");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password and Confirm Password didn't match");
  }

  const isEmailExist = await Auth.findOne({ email, isActive: true });
  if (isEmailExist) {
    throw new ApiError(400, "Email already exists");
  }

  const existInactive = await Auth.findOne({ email, isActive: false });
  if (existInactive) {
    await User.deleteOne({ authId: existInactive._id });
    await Auth.deleteOne({ email });
  }

  const auth = {
    email,
    role,
    password,
    confirmPassword,
    expirationTime: Date.now() + 3 * 60 * 1000,
  };

  const activationToken = createActivationToken();
  const activationCode = activationToken.activationCode;
  auth.activationCode = activationCode;
  auth.name = other.name;
  const data = { user: { name: auth.name }, activationCode };

  try {
    sendEmail({
      email: auth.email,
      subject: "Activate Your Account",
      html: registrationSuccessEmailBody(data),
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }


  const createAuth = await Auth.create(auth);
  if (!createAuth) {
    throw new ApiError(500, "Failed to create user");
  }

  other.authId = createAuth._id;

  let result = {}
  if (role === ENUM_USER_ROLE.USER) {
    result = await User.create(other);
  } else if (role === ENUM_USER_ROLE.ADMIN) {
    result = await Admin.create(other);
  } else if (role === ENUM_USER_ROLE.DRIVER) {
    result = await User.create(other);
  } else {
    throw new ApiError(400, "Invalid role provided!");
  }

  return result
};

// Activate user - done
const activateAccount = async (payload) => {
  const { activation_code, userEmail } = payload;

  const existUser = await Auth.findOne({ email: userEmail });
  if (!existUser) {
    throw new ApiError(400, "User not found");
  }
  if (existUser.activationCode !== activation_code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match!");
  }
  const user = await Auth.findOneAndUpdate(
    { email: userEmail },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  );

  const accessToken = jwtHelpers.createToken(
    {
      userId: existUser._id,
      role: existUser.role,
    },
    config.jwt.secret,
    config.jwt.expires_in
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId: existUser._id, role: existUser.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );
  return {
    accessToken,
    refreshToken,
    user,
  };
};

// Login user - done
const loginAccount = async (payload) => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);
  const checkUser = await Auth.findOne({ email });
  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }
  if (isUserExist.isActive === false) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Please activate your account then try to login"
    );
  }

  const { _id: userId, role } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { userId, role, conversationId: checkUser?.conversationId },
    config.jwt.secret,
    config.jwt.expires_in
  );
  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    id: checkUser?._id,
    conversationId: checkUser?.conversationId,
    isPaid: checkUser?.isPaid,
    accessToken,
    refreshToken,
  };
};

// Scheduled task to delete expired inactive users - done
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        expirationTime: { $lte: now },
      },
      {
        $unset: { activationCode: '' },
      },
    );

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`,
      );
    }
  } catch (error) {
    logger.error('Error removing activation codes from expired users:', error);
  }
});

// Forgot password - done
const forgotPass = async (payload) => {
  const user = await Auth.findOne(
    { email: payload.email },
    { _id: 1, role: 1, email: 1, name: 1 }
  );

  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not found!");
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
  user.verifyCode = activationCode;
  user.verifyExpire = expiryTime;

  await user.save();

  sendResetEmail(
    user.email,
    `
     <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background: #fff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: #007BFF;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                margin: 20px 0;
                line-height: 1.6;
              }
              .footer {
                text-align: left;
                font-size: 12px;
                color: #777;
                margin-top: 20px;
              }
              a {
                color: #007BFF;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Password Reset Request</h2>
              </div>
              <div class="content">
                <p>Hi ${user.name},</p>
                <p>We received a request to reset your password. Here is your password reset code:</p>
                <h3 style="font-weight: bold;">${activationCode}</h3>
                <p>This code will expire in 15 minutes. Please use it to reset your password.</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>Thank you,</p>
                <p>bdCalling.IT</p>
                <p><a href="https://yourwebsite.com">Visit our website</a></p>
              </div>
            </div>
          </body>
        </html>
      `
  );
};

// Code verify - done
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        verifyExpire: { $lte: now },
      },
      {
        $unset: { codeVerify: false },
      },
    );

    if (result.modifiedCount > 0) {
      logger.info(
        `Removed activation codes from ${result.modifiedCount} expired inactive users`,
      );
    }
  } catch (error) {
    logger.error('Error removing activation codes from expired users:', error);
  }
});
//  done
const forgetActivationCode = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
  return activationCode;
};

// Code verify - done
const checkIsValidForgetActivationCode = async (payload) => {
  const account = await Auth.findOne({ email: payload.email });

  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account does not exist!");
  }

  if (account.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset code!");
  }

  const currentTime = new Date();
  if (currentTime > account.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reset code has expired!");
  }
  const update = await Auth.updateOne({ email: account.email }, { codeVerify: true });;
  account.verifyCode = null;
  await account.save()
  return update;
};

const resetPassword = async (req) => {
  const { userId } = req.user;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
  }

  const auth = await Auth.findOne({ _id: userId }, { _id: 1, codeVerify: 1 });
  if (!auth) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  if (!auth.codeVerify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your OTP is not verified!");
  }
  const hashedPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

  const result = await Auth.updateOne(
    { _id: userId },
    { password: hashedPassword, codeVerify: false }
  );
  return result;
};

// Change password
const changePassword = async (user, payload) => {

  const { userId } = user;

  const { oldPassword, newPassword, confirmPassword } = payload;
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password do not match"
    );
  }
  const isUserExist = await Auth.findOne({ _id: userId }).select("+password");
  if (!isUserExist) {
    throw new ApiError(404, "Account does not exist!");
  }
  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(402, "Old password is incorrect");
  }
  isUserExist.password = newPassword;
  await isUserExist.save();
};

const resendCodeActivationAccount = async (payload) => {
  const email = payload.email;
  const user = await Auth.findOne({ email });

  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }

  const activationCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.activationCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();

   sendResetEmail(
    user.email,
    `<!DOCTYPE html>
     <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${activationCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>
      `
   );
};

const resendCodeForgotAccount = async (payload) => {
  const email = payload.email;
 
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  } 
  const user = await Auth.findOne({ email }); 
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  } 
  const verifyCode = forgetActivationCode();
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000); 
  user.verifyCode = verifyCode;
  user.verifyExpire = expiryTime;
  await user.save();

   sendResetEmail(
    user.email,
    `<!DOCTYPE html>
     <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${verifyCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>
      `
   );
};

const blockAccount = async (id) => {
  const isUserExist = await Auth.findById(id);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "No User Found");
  }
  const result = await Auth.findByIdAndUpdate(
    { _id: id },
    { is_block: !isUserExist.is_block },
    { new: true }
  );

  return result;
};

const AuthService = {
  registrationAccount,
  loginAccount,
  changePassword,
  forgotPass,
  resetPassword,
  activateAccount,
  checkIsValidForgetActivationCode,
  resendCodeActivationAccount,
  blockAccount,
  resendCodeForgotAccount
};

module.exports = { AuthService };
