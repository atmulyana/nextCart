import type { NextConfig } from "next";

const path = require('path');
const cfg = require('./src/config/usable-on-client.json');
const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

const nextConfig: NextConfig = {
    /** `basePath` must be set via `baseUrl` in "./src/config/usable-on-client.json" to make consistency in the entire app source code */
    basePath: new URL(cfg.baseUrl).pathname.replace(/\/+$/, ''),
    webpack: (config, {dev, isServer, nextRuntime}) => {
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

        if (isServer && nextRuntime == 'nodejs') {
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

        const reConfig = /src[/\\]config[/\\]([^/\\]+\.json|custom\.less)$/;
        if (isServer && nextRuntime == 'nodejs') {
            config.module.rules.unshift(
                {
                    test: reConfig,
                    loader: "file-loader",
                    type: 'asset/resource',
                    options: {
                        name() {
                            let path = 'config/[name].[ext]';
                            if (!dev) path = '../' + path;
                            return path;
                        },
                    }
                },
                {
                    test: /src[/\\]lib[/\\]payments[/\\]gateway-names\.js$/,
                    loader: `val-loader`,
                }
            );
        }
        else {
            config.resolve.alias[path.resolve(__dirname, './src/config/*.json')] = false;
            config.resolve.alias[path.resolve(__dirname, './src/config/custom.less')] = false;
            // config.module.rules.unshift({
            //     test: reConfig,
            //     loader: "null-loader",
            //     type: 'asset/resource',
            // });
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