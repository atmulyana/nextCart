/** 
 * https://github.com/atmulyana/nextCart
 **/
const crypto = require('crypto');
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
    const env = {};
    let envRows = [], isDirty = false;
    try {
        envRows = fs.readFileSync(envPath, 'utf8').split('\n');
    }
    catch {}
    for (let envItem of envRows) {
        const sepIdx = envItem.indexOf('=');
        let varname, value;
        if ( sepIdx >= 0) {
            varname = envItem.substring(0, sepIdx).trim();
            value = envItem.substring(sepIdx + 1).trim();
        }
        else {
            varname = envItem.trim();
            value = emptyString;
        }
        if (varname) env[varname] = value;
    }

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
    if (JSON.parse(env.AUTH_SECRET) != newValue) {
        env.AUTH_SECRET = JSON.stringify(newValue);
        isDirty = true;
    }

    if (isDirty) {
        envRows = [];
        for (let varname in env) envRows.push(varname + '=' + env[varname]);
        fs.writeFileSync(envPath, envRows.join('\n'));
    }
}

function setEnvVarsFromConfig() {
    const projectRoot = getProjectRoot();
    let configDir = `${projectRoot}/.next/server/config/`;
    if (!fs.existsSync(configDir)) {
        configDir = `${projectRoot}/src/config/`;
    }
    const sCfg = readJSON(`${configDir}/session.json`, false);
    let slCfg;
    const slCfgPath = `${configDir}/session-local.json`;
    if (!fs.existsSync(slCfgPath)) {
        slCfg = {
            secret: crypto.randomBytes(32).toString('base64'),
        };
        saveJSON(slCfgPath, slCfg);
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