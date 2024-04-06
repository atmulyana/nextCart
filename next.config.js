/** @type {import('next').NextConfig} */

const nextConfig = {
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
}

module.exports = nextConfig;
