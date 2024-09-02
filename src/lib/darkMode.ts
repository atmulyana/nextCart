'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
const changeListeners: Array<() => any> = [];
let darkMedia: MediaQueryList | undefined;
const $$darkMode: {
    init(): void,
    value: boolean | null,
    readonly isDark: boolean,
    addChangeListener(fn: () => any): void,
    removeChangeListener(fn: () => any): void,
    setTheme(isDark?: boolean): void,
} = {
    init() {
        darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
        $$darkMode.setTheme();
        darkMedia.addEventListener('change', () => {
            if ($$darkMode.value === null) $$darkMode.setTheme();
        });
    },

    get value() {
        let darkMode = localStorage.getItem('darkMode');
        return darkMode === '1' ? true :
            darkMode === '0' ? false :       
            null;
    },

    set value(val) {
        let isDark;
        if (typeof(val) == 'boolean') {
            localStorage.setItem('darkMode', val ? '1' : '0');
            isDark = val;
        }
        else {
            localStorage.removeItem('darkMode');
            isDark = darkMedia?.matches ?? false;
        }
        this.setTheme(isDark);
    },

    get isDark() {
        return this.value ?? darkMedia?.matches ?? false;
    },

    addChangeListener(fn) {
        if (typeof(fn) == 'function') changeListeners.push(fn);
    },

    removeChangeListener(fn) {
        var idx = changeListeners.indexOf(fn);
        if (idx >= 0) changeListeners.splice(idx, 1);
    },

    setTheme(isDark = $$darkMode.isDark) {
        var root = document.querySelector(':root') as HTMLElement;
        if (!root) return ;
        var fgColor = root.style.getPropertyValue('--fg-color');
        
        if (isDark) {
            root.classList.add('dark');
            root.style.setProperty('--fg-color', 'white');
            root.style.setProperty('--bg-color', 'black');
            root.style.setProperty('--input-text-color', '#cbd5e1');
            root.style.setProperty('--input-border-color', '#cbd5e1');
        }
        else {
            root.classList.remove('dark');
            root.style.setProperty('--fg-color', 'black');
            root.style.setProperty('--bg-color', 'white');
            root.style.setProperty('--input-text-color', '#475569');
            root.style.setProperty('--input-border-color', '#cbd5e1');
        }

        if (root.style.getPropertyValue('--fg-color') !== fgColor) {
            for (var listener of changeListeners) listener();
        }
    }
};

export default $$darkMode;