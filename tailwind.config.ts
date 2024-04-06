import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './node_modules/flowbite-react/**/Alert/*.js',
        './node_modules/flowbite-react/**/Carousel/*.js',
        './node_modules/flowbite-react/**/Dropdown/*.js',
        './node_modules/flowbite-react/**/Modal/*.js',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/modules/**/*.{js,ts,jsx,tsx,mdx}',
        './src/partials/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    plugins: [
        require("flowbite/plugin")
    ],
    // safelist: [
    //     'notify-success',
    //     'notify-warning',
    //     'notify-danger',
    // ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
}
export default config
