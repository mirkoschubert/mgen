module.exports = {
  youtube: {
    render: (attrs, env) => {
      if (!attrs.id) {
        throw new Error('There must be at least an ID')
      }
      const width = attrs.width || '560'
      const height = attrs.height || '325'

      let out = '<iframe width="' + width + '" height="' + height + '" src="https://www.youtube-nocookie.com/embed/' + attrs.id + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      return out
    }
  }
}
