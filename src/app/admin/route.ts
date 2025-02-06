/** 
 * https://github.com/atmulyana/nextCart
 **/
import {permanentRedirect} from "next/navigation";

export function GET() {
    permanentRedirect('/admin/dashboard');
}