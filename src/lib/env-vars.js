/** 
 * https://github.com/atmulyana/nextCart
 **/
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const {emptyString} = require('javascript-common');
const {projectRoot, readJSON, saveJSON} = require('./file-util');

function getProjectRoot() {
    return projectRoot() || path.resolve(__dirname, '../../');
}

function setEnvVars(clientCfg, sessionCfg, projectRoot) {
    if (!projectRoot) projectRoot = getProjectRoot();
    const envPath = `${projectRoot}/.env.local`;
    let env = {};
    let isDirty = false;
    try {
        const envStr = fs.readFileSync(envPath, 'utf8');
        env = dotenv.parse(envStr);
    }
    catch {}

    let newValue = clientCfg.baseUrl.toString();
    if (env.APP_BASE_URL != newValue) {
        env.APP_BASE_URL = newValue;
        isDirty = true;
    }

    newValue = clientCfg.paymentGateway.join(',');
    if (env.APP_GATEWAY != newValue) {
        env.APP_GATEWAY = newValue;
        isDirty = true;
    }

    newValue = sessionCfg.paramName;
    if (env.AUTH_COOKIE_NAME != newValue) {
        env.AUTH_COOKIE_NAME = newValue;
        isDirty = true;
    }

    newValue = sessionCfg.maxAge?.toString() || emptyString;
    if (env.AUTH_COOKIE_EXPIRES != newValue) {
        env.AUTH_COOKIE_EXPIRES = newValue;
        isDirty = true;
    }

    newValue = sessionCfg.secret;
    if (env.AUTH_SECRET != newValue) {
        env.AUTH_SECRET = newValue;
        isDirty = true;
    }

    if (isDirty) {
        const envRows = [];
        for (let varname in env) {
            const value = ['AUTH_COOKIE_NAME', 'AUTH_COOKIE_EXPIRES'].includes(varname)
                ? env[varname]
                : `"${env[varname].replaceAll('"', '\\"')}"`
            envRows.push(varname + '=' + value);
        }
        fs.writeFileSync(envPath, envRows.join('\n'));
    }
}

function setEnvVarsFromConfig(isDev = false) {
    const projectRoot = getProjectRoot();
    let configDir = `${projectRoot}/.next/server/config`;
    if (!fs.existsSync(configDir) || isDev) {
        configDir = `${projectRoot}/src/config`;
    }
    const sCfg = readJSON(`${configDir}/session.json`, false);
    let slCfg;
    const slCfgPath = `${configDir}/session-local.json`;
    if (!fs.existsSync(slCfgPath)) {
        try {
            slCfg = {
                secret: crypto.randomBytes(32).toString('base64'),
            };
            saveJSON(slCfgPath, slCfg);
        }
        catch {
        }
    }
    else {
        slCfg = readJSON(slCfgPath, false);
    }
    setEnvVars(
        readJSON(`${configDir}/usable-on-client.json`, false),
        {...sCfg, ...slCfg}
    );
}

module.exports = {
    setEnvVars,
    setEnvVarsFromConfig
};