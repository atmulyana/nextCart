/***
 * https://github.com/atmulyana/nextCart
 * 
 * Create `email-local.json` in the same directory to overwrite the email settings.
 * The file won't be uploaded to GIT repository
 ***/
const {readJSON} = require('@/lib/file-util');
try {
    require('./email-local.json');
}
catch {}

const config = {
    host: "<Your SMTP server>",
    port: 587, //SMTP prort
    secure: false, //SMTP connection: using secure connection or not
    user: "<Your SMTP user>",
    password: "<Your SMPTP password>",
    fromAddress: "<your-support@email.address>", //It's `From` address of the email sent to customer when an order is created
};


let localCfg: Partial<typeof config> = {};
try {
    localCfg = readJSON('/config/email-local.json');
}
catch {}

export default {
    ...config,
    ...localCfg,
};