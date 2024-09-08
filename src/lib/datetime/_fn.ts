/** 
 * https://github.com/atmulyana/nextCart
 **/
import JsSimpleDateFormat, {JsDateFormatSymbols, TimerFormat, TimerFormatSymbols} from 'jssimpledateformat';

export default function(lang: (s: string) => string, currentLocale: () => string) { 
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

    const formatDate = (date: Date | number | string, format?: string) => !date ? '' :
        (format
            ? new JsSimpleDateFormat(format, currentLocale())
            : (defaultDateTimeFormat.setDateFormatSymbols(new JsDateFormatSymbols(currentLocale())), defaultDateTimeFormat)
        ).format(new Date(date));

    const timeAgo = (date: Date) => (
        defaultTimerFormat.setTimerFormatSymbols(new TimerFormatSymbols(currentLocale())),
        defaultTimerFormat
    ).approxFormat(
        new Date().getTime() - new Date(date).getTime(),
        '',
        lang('Ago')?.toLowerCase()
    );

    return {
        formatDate,
        timeAgo,
    };
}