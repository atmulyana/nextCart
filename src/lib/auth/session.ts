/** 
 * https://github.com/atmulyana/nextCart
 **/
import {deleteExpiredSessions} from "@/data/session";


export function cleanSessions() {
    function run() {
        /* await */ deleteExpiredSessions();
        const nextDate = new Date();
        nextDate.setHours(0, 0, 0, 0);
        nextDate.setDate(nextDate.getDate() + 1);
        setTimeout(run, nextDate.getTime() - Date.now());
    }
    run();
}