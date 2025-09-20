/** 
 * https://github.com/atmulyana/nextCart
 **/
const fs = require('fs');

module.exports = function yearsInMs() {
    const gateways = [];

    fs.readdirSync(__dirname, {withFileTypes: true}).forEach(f => {
        if (f.isDirectory()) gateways.push(f.name);
    });

    return {
        code: "module.exports = " + JSON.stringify(gateways),
    };
};