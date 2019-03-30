var hljs = require('highlight.js')
const shortcodes = require('./shortcodes')

const markdown = require('markdown-it')({
  html: true,
  linkify: true,
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
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-checkbox'))
  .use(require('markdown-it-anchor'))
  .use(require('markdown-it-toc-done-right'), {
    level: 2,
    listType: 'ul'
  })
  .use(require('markdown-it-shortcode-tag'), shortcodes)

module.exports = markdown
