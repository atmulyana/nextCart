/** 
 * https://github.com/atmulyana/nextCart
 **/
const param = process.argv[2];

if (param.includes('l')) {
    require('./src/data/lang/createData');
}
if (param.includes('e')) {
    require("./src/lib/env-vars").setEnvVarsFromConfig(param.includes('d'));
}