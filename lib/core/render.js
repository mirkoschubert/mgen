const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const cleanhtml = require('clean-html')
const frontmatter = require('front-matter')
const pug = require('pug')
const util = require('./util')
const markdown = require('./markdown')

const config = require('./config').getConfigSync()
const source = path.join(process.cwd(), config.build.source)
const destination = path.join(process.cwd(), config.build.destination)

// INFO: PAGE

const getDestinationPath = src => {
  let p = path.parse(src)
  let rel = p.dir.replace(path.join(source, config.build.paths.content), '')
  if (p.base === 'index.md' || p.base === '_index.md') {
    return path.join(destination, rel, 'index.html')
  } else {
    return path.join(destination, rel, p.name, 'index.html')
  }
}

const getPageData = async src => {
  // read Markdown (Frontmatter & Content)
  const file = await fs.readFile(src, 'utf8')
  const content = frontmatter(file)
  const data = content.attributes

  data.content = markdown.render(content.body).trim()
  data.paths = {
    src: src,
    dest: getDestinationPath(src),
    relative: src.replace(path.join(source, config.build.paths.content), ''),
    layout: path.join(process.cwd(), config.build.source, config.build.paths.layouts, 'types', ((!data.type) ? 'page.pug' : data.type + '.pug'))
  }

  return data
}

const getPagesData = async gl => {
  const pages = []
  const files = await util.getFiles(gl)

  for (const file of files) {
    let page = await getPageData(file)
    pages.push(page)
  }
  return pages
}

const renderPage = async data => {
  const template = await fs.readFile(data.page.paths.layout, 'utf8')
  const rendered = pug.render(template, {
    filename: data.page.paths.layout,
    basedir: path.join(process.cwd(), config.build.source, config.build.paths.layouts),
    globals: [],
    site: data.site,
    page: data.page,
    menues: data.menues,
    compileDebug: true
  })

  cleanhtml.clean(rendered, { wrap: 0 }, async html => {
    try {
      await fs.outputFile(data.page.paths.dest, html)
      console.log(chalk.green(data.page.paths.relative), 'has been rendered.')
    } catch (e) {
      console.error(e.message)
    }
  })
}

// INFO: GLOBAL

const compileMenues = () => {
  // compile menues
}

const one = async (src, options) => {
  options = options || {}

  const page = await getPageData(src)

  await renderPage({
    site: config.site,
    menues: config.menues,
    page: page
  })
}

const all = async (gl, options) => {
  options = options || {}

  const pages = await getPagesData(gl)

  for (const page of pages) {
    await renderPage({
      site: config.site,
      menues: config.menues,
      page: page
    })
  }
}

module.exports = {
  all,
  one
}
