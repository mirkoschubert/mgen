const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const merge = require('deepmerge')

const defaults = {
  site: {
    title: 'MGEN - just another modular static site generator',
    url: 'https://localhost:3000'
  },
  build: {
    source: 'src',
    destination: 'build',
    paths: {
      assets: 'assets',
      content: 'content',
      layouts: 'layouts'
    },
    host: 'localhost',
    port: 3000
  }
}

const getConfig = async () => {
  var exists = await fs.exists(path.join(process.cwd(), '.mgenrc'))

  if (exists) {
    var file = await fs.readFile(path.join(process.cwd(), '.mgenrc'))
    return merge(defaults, yaml.safeLoad(file))
  } else {
    console.error('You have to create a .mgenrc file in your project directory!')
    return false
  }
}

const getConfigSync = () => {
  if (fs.existsSync(path.join(process.cwd(), '.mgenrc'))) {
    return merge(defaults, yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), '.mgenrc'))))
  } else {
    console.error('You have to create a .mgenrc file in your project directory!')
    return false
  }
}

module.exports = {
  getConfig,
  getConfigSync
}
