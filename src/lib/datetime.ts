/** 
 * https://github.com/atmulyana/nextCart
 **/
import JsSimpleDateFormat, {JsDateFormatSymbols, TimerFormat, TimerFormatSymbols} from 'jssimpledateformat';
import lang, {currentLocale} from '@/data/lang';

Object.assign((TimerFormatSymbols as any).__symbols__, {
	it: {
		fewSeconds: 'qualche secondo',
		aMinute: 'un minuto',
		minutes: '${count} minuti',
		anHour: "un'ora",
		hours: '${count} ore',
        aDay: 'un giorno',
        days: '${count} giorni',
        aMonth: 'un mese',
        months: '${count} mesi',
        aYear: 'un anno',
        years: '${count} anni'
	},
});

const defaultDateTimeFormat = new JsSimpleDateFormat('dd/MM/yyyy hh:mma', currentLocale());
const defaultTimerFormat = new TimerFormat('', currentLocale());

export const formatDate = (date: Date | number, format?: string) => (format
    ? new JsSimpleDateFormat(format, currentLocale())
    : (defaultDateTimeFormat.setDateFormatSymbols(new JsDateFormatSymbols(currentLocale())), defaultDateTimeFormat)
).format(new Date(date));

export const timeAgo = (date: Date) => (
    defaultTimerFormat.setTimerFormatSymbols(new TimerFormatSymbols(currentLocale())),
    defaultTimerFormat
).approxFormat(
    new Date().getTime() - new Date(date).getTime(),
    '',
    lang('Ago')?.toLowerCase()
);