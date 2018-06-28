const buildDLL = require('../lib/build/build-dll');
const buildBusiness = require('../lib/build/build-business');
const checkProConf = require('../lib/build/check-project-config');
const cs = require('../lib/console');
const conf = require('../lib/config');

cs.buildLog(`开始打包：${process.env.NODE_ENV === 'production' ? '发布' : '开发'}模式`, 'info');

const envMap = {
    dev: 'development',
    prd: 'production'
}

const build = (type, options) => {
    type = type || 'dev'

    process.SUPERKAOLA_ENV = envMap[type]
    process.SUPERMAN_ROOT = path.resolve(__dirname, '..')

    let buildConf = helper.findConfig(
        path.resolve(conf.root, `./${conf.CONF_FILE_NAME}`),
        'build'
    )

    if (!checkProConf(buildConf)) helper.stop(true);

    const { entry } = options;

    if (entry) {
        buildConf.entry = entry;
    }

    const dllPromise = new Promise((resolve) => {
        if (process.env.npm_config_rebuild_dll) {
            buildDLL(() => {
                resolve(true);
            });
        } else {
            resolve(false);
        }
    })

    dllPromise.then(() => {
        buildBusiness();
    })
}

build()