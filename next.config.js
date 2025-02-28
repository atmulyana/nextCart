/** @type {import('next').NextConfig} */

const cfg = require('./src/config/usable-on-client.json');

const nextConfig = {
    /** `basePath` must be set via `baseUrl` in "./src/config/usable-on-client.json" to make consistency in the entire app source code */
    basePath: new URL(cfg.baseUrl).pathname.replace(/\/+$/, ''),
    webpack: (config, {dev, isServer}) => {
        if (isServer) {
            config.module.rules.push(
                {
                    test: /data(\/|\\)lang(\/|\\)data\.sqlite$/,
                    loader: "file-loader",
                    options: {
                        name: dev ? 'data/lang/data.sqlite' : '../data/lang/data.sqlite',
                    }
                },
            );
        }
        config.experiments.topLevelAwait = true;
        //config.node = {global: true};
        return config;
    },

    async headers() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'cookie',
                        key: 'locale',
                    },
                ],
                headers: [
                    {
                        key: 'Content-Language',
                        value: ':locale',
                    },
                ],
            },
        ]
    },

    experimental: {
        //ppr: false,
        authInterrupts: true,
        staleTimes: {
            dynamic: 0,
        },
        internal_disableSyncDynamicAPIWarnings: true,
    },
    // serverExternalPackages: [
    //     '@react-email/render',
    // ],
}

module.exports = nextConfig;
