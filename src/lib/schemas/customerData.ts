/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from '.';

export default z.form({
    email: z.string().chain(str => str.email()),
    company: z.string().chain(str => str.optional()),
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string().chain(str => str.optional()),
    country: z.string(),
    state: z.string(),
    postcode: z.string(),
    phone: z.string(),
});