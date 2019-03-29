const glob = require('glob')

const getFiles = gl => {
  return new Promise((resolve, reject) => {
    glob(gl, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

module.exports = {
  getFiles
}
