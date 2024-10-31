/** 
 * https://github.com/atmulyana/nextCart
 **/
import JsSimpleDateFormat, {JsDateFormatSymbols, TimerFormat, TimerFormatSymbols} from 'jssimpledateformat';

type R = string | Promise<string>;
type L = string | undefined;
type Return<T, U> = (
    U extends string       ? string :
    T extends Promise<any> ? Promise<string> :
                             string
);
type ObjectReturn<T extends R> = {
    formatDate: <U extends L>(date: Date | number | string, format?: string | null, locale?: U) => Return<T, U>,
    timeAgo: <U extends L>(date: Date | number | string, locale?: U) => Return<T, U>,
};

export default function<T extends R>(lang: (s: string) => string, currentLocale: () => T): ObjectReturn<T> {
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

    const defaultDateTimeFormat = new JsSimpleDateFormat('dd/MM/yyyy hh:mma', 'en');
    const defaultTimerFormat = new TimerFormat('', 'en');

    const _formatDate = (date: Date | number | string | null, locale: string, format?: string | null) => !date ? '' :
        (format
            ? new JsSimpleDateFormat(format, locale)
            : (defaultDateTimeFormat.setDateFormatSymbols(new JsDateFormatSymbols(locale)), defaultDateTimeFormat)
        ).format(new Date(date));

    const _timeAgo = (date: Date | number | string, locale: string) => (
        defaultTimerFormat.setTimerFormatSymbols(new TimerFormatSymbols(locale)),
        defaultTimerFormat
    ).approxFormat(
        new Date().getTime() - new Date(date || 0).getTime(),
        '',
        lang('Ago')?.toLowerCase()
    );

    return {
        formatDate<U extends L>(date: Date | number | string, format?: string | null, locale?: U) {
            const localeCode = locale || currentLocale();
            if (localeCode instanceof Promise) {
                return localeCode.then(code => _formatDate(date, code, format)) as Return<T, U>;
            }
            else {
                return _formatDate(date, localeCode, format) as Return<T, U>;
            }
        },
        timeAgo<U extends L>(date: Date | number | string, locale?: U) {
            const localeCode = locale || currentLocale();
            if (localeCode instanceof Promise) {
                return localeCode.then(code => _timeAgo(date, code)) as Return<T, U>;
            }
            else {
                return _timeAgo(date, localeCode) as Return<T, U>;
            }
        },
    };
}