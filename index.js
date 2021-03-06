#!/usr/bin/env node

const program = require('commander')
const pkg = require('./package.json')
const init = require('./bin/init')
const cdn = require('./bin/cdn')
const build = require('./bin/build')
const upgrade = require('./bin/upgrade')

const buildAction = type => options => build(type, undefined, options)

program
    .version(pkg.version, '-v, --version')

// 初始化配置文件

program
    .command('init')
    .description('初始化配置')
    .action(init)

program
    .command('cdn')
    .option('-b, --bucket [bucket]', '指定 cdn 上传的 bucket')
    .description('上传文件到cdn')
    .action(cdn)

program
    .command('dev')
    .description('开发环境打包')
    .action(buildAction('dev'))
program
    .command('prd')
    .description('生产环境打包')
    .action(buildAction('prd'))

program
    .command('upgrade')
    .description('升级 superkaola 配置文件')
    .action(upgrade)

program.parse(process.argv)
