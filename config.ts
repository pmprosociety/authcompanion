// All environment variables go here
import "https://deno.land/x/dotenv@v2.0.0/load.ts"; // Autoload config file

//Server related environment variables
//Authcompanion port
export const AUTHPORT = Deno.env.get("PORT");
//CORS Allowed Origin
export const ORIGIN = Deno.env.get("ORIGIN");
//Secure Cookie
export const SECURE = Deno.env.get("SECURE");

//Database related environment variables
//Database user
export const DBUSER = Deno.env.get("DBUSER");
//Database name
export const DATABASE = Deno.env.get("DATABASE");
//Database hostname
export const DBHOSTNAME = Deno.env.get("DBHOSTNAME");
//Database user password
export const DBPASSWORD = Deno.env.get("DBPASSWORD");
//Database port
export const DBPORT = Deno.env.get("DBPORT");
//Database pool max connections
export const DBCONNECTIONS = Deno.env.get("DBCONNECTIONS");

//JWT related environment variables
export const ACCESSTOKENKEY = Deno.env.get("ACCESSTOKENKEY");
export const REFRESHTOKENKEY = Deno.env.get("REFRESHTOKENKEY");

//Logging related environment variables
//Log level
export const LOGLEVEL = Deno.env.get("LOGLEVEL");
//Log output handler
export const LOGHANDLER = Deno.env.get("LOGHANDLER");

//Email related environment variables
//SMTP server hostname
export const SMTPHOSTNAME = Deno.env.get("SMTP_HOSTNAME");
//SMTP server port
export const SMTPPORT = Deno.env.get("SMTP_PORT");
//SMTP user
export const SMTPUSER = Deno.env.get("SMTP_USERNAME");
//SMTP user password
export const SMTPPASSWORD = Deno.env.get("SMTP_PASSWORD");
//From address for password recovery emails
export const FROMADDRESS = Deno.env.get("FROM_ADDRESS");
//URL to use for recovery emails
export const RECOVERYURL = Deno.env.get("RECOVERY_REDIRECT_URL");
