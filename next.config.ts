import type { NextConfig } from "next";

const cfg = require('./src/config/usable-on-client.json');
const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

const nextConfig: NextConfig = {
    /** `basePath` must be set via `baseUrl` in "./src/config/usable-on-client.json" to make consistency in the entire app source code */
    basePath: new URL(cfg.baseUrl).pathname.replace(/\/+$/, ''),
    webpack: (config, {dev, isServer, defaultLoaders}) => {
        config.resolve.alias['@__server__'] = './server';
        config.resolve.alias['@__server__/*'] = './server/*';
        config.module.rules.push({
            issuerLayer: config.module.rules.find(
                (r: any) => r.loader == 'next-invalid-import-error-loader' && r.test[0].toString() == '/^server-only$/'
            ).issuerLayer,
            resolve: {
                alias: {
                    '@__server__': false,
                    '@__server__/*': false,
                }
            }
        });

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
        
        config.experiments = {...config.experiments, topLevelAwait: true};
        //config.output = {...config.output, chunkFormat: 'module'};
        //config.target = "es2022";
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
        //internal_disableSyncDynamicAPIWarnings: true,
    },
    // serverExternalPackages: [
    //     '@react-email/render',
    // ],
    // eslint: {
    //     ignoreDuringBuilds: true,
    // },
};

export default withFlowbiteReact(nextConfig);