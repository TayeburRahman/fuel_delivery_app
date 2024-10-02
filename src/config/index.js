const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

// Validate configuration and throw errors if required environment variables are missing
const validateConfig = (config) => {
  if (!config.jwt.secret) {
    throw new Error("Missing JWT secret");
  }
  if (!config.database_url) {
    throw new Error("Missing database URL");
  }
  // Add more validation as needed
};

// Define your configuration
const config = {
  env: process.env.NODE_ENV,
  app_name: process.env.APP_NAME,
  port: process.env.PORT,
  socket_port: process.env.SOCKET_PORT,
  base_url: process.env.BASE_URL,
  database_url: process.env.MONGO_URL,
  database_password: process.env.DB_PASSWORD,
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  smtp: {
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_service: process.env.SMTP_SERVICE,
    smtp_mail: process.env.SMTP_MAIL,
    smtp_password: process.env.SMTP_PASSWORD,
    NAME: process.env.SERVICE_NAME,
  },
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  }, 
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  },
};

// Validate configuration
validateConfig(config);

module.exports = config;
