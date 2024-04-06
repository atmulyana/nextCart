var $$darkMode = (function() {
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    
    const $$darkMode = {
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
                isDark = darkMedia.matches;
            }
            this.setTheme(isDark);
        },

        get isDark() {
            return this.value ?? darkMedia.matches;
        },

        setTheme(isDark = $$darkMode.isDark) {
            const root = document.querySelector(':root');
            if (isDark) {
                document.documentElement.classList.add('dark');
                root.style.setProperty('--fg-color', 'white');
                root.style.setProperty('--bg-color', 'black');
            }
            else {
                document.documentElement.classList.remove('dark');
                root.style.setProperty('--fg-color', 'black');
                root.style.setProperty('--bg-color', 'white');
            }
        }
    }
    
    $$darkMode.setTheme();
    darkMedia.addEventListener('change', () => {
        if ($$darkMode.value === null) $$darkMode.setTheme();
    });

    return $$darkMode;
})();
