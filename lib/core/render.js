const fs = require('fs-extra')
const path = require('path')
const cleanhtml = require('clean-html')
const frontmatter = require('front-matter')
const pug = require('pug')

var hljs = require('highlight.js')

const markdown = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>'
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + markdown.utils.escapeHtml(str) + '</code></pre>'
  }
})

const config = require('./config').getConfigSync()

const compileMenues = () => {
  // compile menues
}

module.exports = async (src, options) => {
  options = options || {}

  const data = {
    site: config.site,
    menues: config.menues
  }

  data.site.generator = '<meta name="generator" content="mgen 0.1.0">'

  if (fs.existsSync(src)) {
    const file = await fs.readFile(src, 'utf8')
    const content = frontmatter(file)
    data.page = content.attributes
    data.page.content = markdown.render(content.body).trim()
  }
  // console.log(data)

  // Render PUG
  const layout = path.join(process.cwd(), config.build.source, config.build.paths.layouts, 'types', ((!data.page.type) ? 'page.pug' : data.page.type + '.pug'))

  const template = await fs.readFile(layout, 'utf8')
  const page = pug.render(template, {
    filename: layout,
    basedir: path.join(process.cwd(), config.build.source, config.build.paths.layouts),
    globals: [],
    site: data.site,
    page: data.page,
    menues: data.menues,
    compileDebug: true
  })
  cleanhtml.clean(page, { wrap: 0 }, async html => {
    try {
      await fs.writeFile(path.join(process.cwd(), config.build.destination, path.basename(src).substr(0, path.basename(src).indexOf('.md')) + '.html'), html)
      console.log(path.basename(src), 'has been rendered to HTML.')
    } catch (e) {
      console.error(e.message)
    }
  })
}
