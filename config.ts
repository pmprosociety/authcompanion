// All environment variables go here
import "https://deno.land/x/dotenv@v2.0.0/load.ts"; // Autoload config file

//Server related environment variables
//Authcompanion port
const AUTHPORT = Deno.env.get("PORT");
//CORS Allowed Origin
const ORIGIN = Deno.env.get("ORIGIN");
//Secure Cookie
const SECURE = Deno.env.get("SECURE");

//Database related environment variables
//Database user
const DBUSER = Deno.env.get("DB_USER");
//Database name
const DATABASE = Deno.env.get("DATABASE");
//Database hostname
const DBHOSTNAME = Deno.env.get("DB_HOSTNAME");
//Database user password
const DBPASSWORD = Deno.env.get("DB_PASSWORD");
//Database port
const DBPORT = Deno.env.get("DB_PORT");
//Database pool max connections
const DBCONNECTIONS = Deno.env.get("MAX_DB_CONNECTIONS");

//JWT related environment variables
const ACCESSTOKENKEY = Deno.env.get("ACCESS_TOKEN_KEY");
const REFRESHTOKENKEY = Deno.env.get("REFRESH_TOKEN_KEY");

//Logging related environment variables
//Log level
const LOGLEVEL = Deno.env.get("LOG_LEVEL");
//Log output handler
const LOGHANDLER = Deno.env.get("LOG_HANDLER");

//Email related environment variables
//SMTP server hostname
const SMTPHOSTNAME = Deno.env.get("SMTP_HOSTNAME");
//SMTP server port
const SMTPPORT = Deno.env.get("SMTP_PORT");
//SMTP user
const SMTPUSER = Deno.env.get("SMTP_USERNAME");
//SMTP user password
const SMTPPASSWORD = Deno.env.get("SMTP_PASSWORD");
//From address for password recovery emails
const FROMADDRESS = Deno.env.get("FROM_ADDRESS");
//URL to use for recovery emails
const RECOVERYURL = Deno.env.get("RECOVERY_REDIRECT_URL");

//Webhook related environment variables
//Webhook URL
const WEBHOOKURL = Deno.env.get("WEBHOOK_URL");
const WEBHOOKSECRET = Deno.env.get("WEBHOOK_SECRET");

export default {
  AUTHPORT,
  ORIGIN,
  SECURE,
  DBUSER,
  DATABASE,
  DBHOSTNAME,
  DBPASSWORD,
  DBPORT,
  DBCONNECTIONS,
  ACCESSTOKENKEY,
  REFRESHTOKENKEY,
  LOGLEVEL,
  LOGHANDLER,
  SMTPHOSTNAME,
  SMTPPORT,
  SMTPUSER,
  SMTPPASSWORD,
  FROMADDRESS,
  RECOVERYURL,
  WEBHOOKURL,
  WEBHOOKSECRET,
};
