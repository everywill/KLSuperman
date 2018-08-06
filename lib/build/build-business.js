const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const clean = require('./clean')
const startDevServer = require('./dev-server')
const analyze = require('./analyze')
const config = require('../config')
const helper = require('../helper')
const cs = require('../console')


const getBusinessWebpackConfig = (proBuildInfo, needDll) => {
    let proWebpackConf
    const webpackConfigName = process.env.SUPERKAOLA_ENV === 'production' ? 'webpack.prod.config' : 'webpack.dev.config'
    const commonBusinessWebpackConfig = require(path.join(process.env.SUPERKAOLA_ROOT, `webpack-config/${webpackConfigName}`))(Object.assign({}, proBuildInfo, {
        root: config.root,
        babel: config.babel,
        postcss: config.postcss,
        needDll,
    }))

    if (proBuildInfo.extra && proBuildInfo.extra.webpackConfigPath) {
        try {
            proWebpackConf = require(path.resolve(config.root, proBuildInfo.extra.webpackConfig))
        } catch (ex) {
            cs.log(ex, 'error')
        }
    }

    const wbpConf = merge(proWebpackConf, commonBusinessWebpackConfig)

    return wbpConf
}

const buildBusiness = (proBuildInfo, needDll, statsDir, options = {}) => {
    const webpackConfig = getBusinessWebpackConfig(proBuildInfo, needDll)

    cs.buildLog('Building bussiness modules, files：')
    cs.buildLog(webpackConfig.entry)

    if (process.env.SUPERKAOLA_ENV === 'production') {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                cs.buildLog(err, 'error')
            }
            if (stats.hasErrors()) {
                cs.buildLog(stats.toString(), 'error')
                helper.stop(true)
            }

            if (statsDir) {
                analyze('business', stats, statsDir)
            } else {
                cs.buildLog(stats.toString(config.stats))
            }

            clean(webpackConfig)
        });
    } else {
        let proxyTarget = options.proxy
        if (proxyTarget && !/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):?([0-9]{1,5})?/.test(proxyTarget)) {
            const proxyTable = require(path.join(proBuildInfo.root, proBuildInfo.build.extra.proxyTable))
            proxyTarget = proxyTable[proxyTarget]
        }
        startDevServer(webpackConfig, {
            proxyTarget,
        })
    }
};

module.exports = buildBusiness;
