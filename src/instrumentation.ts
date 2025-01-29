/** 
 * https://github.com/atmulyana/nextCart
 **/
export async function register() {
    if (process.env.NEXT_RUNTIME == 'nodejs') {
        const mod = await import("./lib/auth/session");
        mod.cleanSessions();
    }
}