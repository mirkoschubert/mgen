const cli = require('commander')

cli
  .version(require('../package.json').version, '-V, --version')
  .description('Another modular static site generator')

cli
  .command('init [name] [blueprint]')
  .description('initializes a new project')
  .option('-f, --force', 'forces to overwrite an existing project')
  .action((name, blueprint, options) => {
    // do something
  })

cli
  .command('config')
  .description('lists all config variables')
  .action(() => {
    const config = require('./core/config')
    const cfg = config.getConfigSync()
    console.log(cfg)
  })

cli
  .command('watch')
  .description('starts a server with hot-reloading')
  .option('-p, --port [port]', 'sets up the port')
  .option('-d, --with-drafts', 'renders all pages, including drafts')
  .action(options => {
    const server = require('./core/server')
    server()
  })

cli
  .command('build')
  .description('builds a production ready static site')
  .action(() => {
    const build = require('./core/build')
    build.all()
  })

cli
  .command('clean')
  .description('empties the build directory')
  .action(() => {
    const build = require('./core/build')
    let cl = build.clean()
    if (cl) console.log('Build directory has been emptied out.')
  })

cli.parse(process.argv)
if (!cli.args.length) cli.help()
