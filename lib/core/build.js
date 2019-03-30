const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const rimraf = require('rimraf')
const sass = require('node-sass')
// const autoprefixer = require('autoprefixer')
const CleanCSS = require('clean-css')
const uglify = require('uglify-js')

const render = require('./render')
const util = require('./util')

const config = require('./config').getConfigSync()
const source = path.join(process.cwd(), config.build.source)
const destination = path.join(process.cwd(), config.build.destination)

const copyCSS = async (src, dest, options) => {
  options = options || {
    minify: false
  }
  // console.log(source1, '->', destination1)

  if (fs.existsSync(src)) {
    try {
      await fs.copy(path.join(src), path.join(dest))
      console.log('CSS successfully copied')
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * Copies a JavaScript file to the build directory
 *
 * @param {String} src absolute source path (file)
 * @param {String} dest absolute destination path (directory)
 * @param {Object} options { minify: false }
 */
const copyJS = async (src, dest, options) => {
  options = options || {
    minify: false
  }

  if (fs.existsSync(src)) {
    try {
      if (options.minify) {
        if (path.basename(src).indexOf('.min.js') === -1) {
          // minify
          let code = await fs.readFile(src, 'utf8')
          let minified = uglify.minify(code).code
          await fs.writeFile(path.join(dest, path.basename(src).substr(0, path.basename(src).indexOf('.js')) + '.min.js'), minified)
          console.log(chalk.green(path.basename(src)), 'has been copied and minified.')
        } else {
          await fs.copy(src, path.join(dest, path.basename(src)))
          console.log(chalk.green(path.basename(source)), 'has been copied.')
        }
      } else {
        await fs.copy(src, path.join(dest, path.basename(src)))
        console.log(chalk.green(path.basename(src)), 'has been copied.')
      }
    } catch (e) {
      console.error(e.message)
    }
  }
}

const renderSASS = async (options) => {
  options = options || {
    minify: false
  }
  const src = path.join(source, config.build.paths.assets, 'sass')
  const dest = path.join(destination, config.build.paths.assets, 'css')

  if (fs.existsSync(src)) {
    let files = await util.getFiles(path.join(src, '**/*.s[ac]ss'))
    files.forEach(f => {
      if (!path.basename(f).startsWith('_')) {
        sass.render({ file: f }, (err, res) => {
          if (!err) {
            // Minify CSS code (with autoprefixer)
            var css = res.css
            if (options.minify) {
              const cleaned = new CleanCSS({ compatibility: '*' }).minify(res.css)
              css = cleaned.styles
            } else {
              const cleaned = new CleanCSS({ compatibility: '*', format: 'beautify' }).minify(res.css)
              css = cleaned.styles
            }

            fs.writeFile(path.join(dest, path.basename(f).substr(0, path.basename(f).indexOf('.')) + ((options.minify) ? '.min.css' : '.css')), css, (e) => {
              if (!e) {
                console.log(chalk.green(path.basename(f)), 'has been rendered.')
              } else {
                console.error(e)
              }
            })
          } else {
            console.error(err)
          }
        })
      }
    })
  }
}

const clean = async () => {
  return new Promise((resolve, reject) => {
    rimraf(path.join(destination, '*'), err => {
      if (!err) {
        resolve(true)
      } else {
        reject(err)
      }
    })
  })
}

const all = async () => {
  // Delete build directory
  let cl = await clean()
  if (cl) console.log('Build directory has been emptied out.')

  // Copy CSS
  await copyCSS(path.join(source, config.build.paths.assets, 'css'), path.join(destination, config.build.paths.assets, 'css'))

  // Render SASS/ SCSS EVERYTHING!
  await renderSASS({ minify: true })

  // Copy JS SEPERATE
  const files = await util.getFiles(path.join(source, config.build.paths.assets, 'js', '**/*.js?(.map)'))
  files.forEach(async f => {
    await copyJS(f, path.join(destination, config.build.paths.assets, 'js'))
  })

  // Copy Fonts

  // Copy Images

  // Render Markdown && Pug EVERYTHING
  await render.all(path.join(source, config.build.paths.content, '**/*.md'))
}

module.exports = {
  all,
  clean,
  copyCSS,
  renderSASS,
  render
}
