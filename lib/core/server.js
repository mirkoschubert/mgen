const path = require('path')
const chokidar = require('chokidar')
const live = require('live-server')

const build = require('./build')

const cwd = process.cwd()

const defaults = {
  port: 3000,
  host: 'localhost',
  root: path.join(cwd, 'build'),
  open: true,
  ignore: '',
  file: '404/index.html',
  wait: 100,
  mount: [], // Mount a directory to a route.
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
  middleware: [(req, res, next) => { next() }]
}

module.exports = async () => {
  await build.all()

  console.log(path.join(cwd, 'src/assets/sass/**/*.sass'))

  // SASS
  var sass = chokidar.watch(path.join(cwd, 'src/assets/sass/**/*.sass'), {
    ignored: /(^|[/\\])\../,
    persistent: true
  })

  sass.on('add', p => build.renderSASS({ minify: true }))
  sass.on('change', p => build.renderSASS({ minify: true }))
  sass.on('unlink', p => { /* delete */ })

  // Markdown
  console.log(path.join(cwd, 'src/content/**/*.md'))
  var markdown = chokidar.watch(path.join(cwd, 'src/content/**/*.md'), {
    ignored: /(^|[/\\])\../,
    persistent: true
  })

  markdown.on('add', p => build.render(path.join(cwd, 'src/content/index.md')))
  markdown.on('change', p => build.render(path.join(cwd, 'src/content/index.md')))
  markdown.on('unlink', p => { /* delete */ })

  // Pug
  console.log(path.join(cwd, 'src/layouts/**.*.pug'))
  var pug = chokidar.watch(path.join(cwd, 'src/layouts/**/*.pug'), {
    ignored: /(^|[/\\])\../,
    persistent: true
  })
  pug.on('add', p => build.render(path.join(cwd, 'src/content/index.md')))
  pug.on('change', p => build.render(path.join(cwd, 'src/content/index.md')))
  pug.on('unlink', p => { /* delete */ })

  live.start(defaults)

  process.on('SIGINT', () => {
    console.log('\nStopping the server...')
    sass.close()
    markdown.close()
    pug.close()
    live.shutdown()
    console.log('Bye!')
    process.exit()
  })
}
