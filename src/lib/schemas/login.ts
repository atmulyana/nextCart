/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from '.';

export default z.form({
    loginEmail: z.string().chain(str => str.email()),
    loginPassword: z.string(),
    referrerUrl: z.string().chain(str => str.optional()),
});