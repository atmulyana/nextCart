import type { Config } from 'tailwindcss'
const flowbite = require("flowbite-react/tailwind")

const config: Config = {
    content: [
        './node_modules/flowbite-react/**/Alert/*.mjs',
        './node_modules/flowbite-react/**/Carousel/*.mjs',
        './node_modules/flowbite-react/**/Dropdown/*.mjs',
        './node_modules/flowbite-react/**/Modal/*.mjs',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/modules/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/payments/**/*.{js,ts,jsx,tsx,mdx}',
        './src/subview/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/subview/partials/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    plugins: [
        flowbite.plugin(),
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
