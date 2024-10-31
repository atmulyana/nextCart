/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from '.';

export default z.form({
    email: z.string().chain(str => str.email()),
});