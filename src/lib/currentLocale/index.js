/** 
 * https://github.com/atmulyana/nextCart
 **/
if (typeof(window) == 'object') {
    module.exports = require('./client');
}
else {
    module.exports = require('./server');
}