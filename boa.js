var co = require('co')
  , compose = require('koa-compose')
  , parse = require('url').parse

var ns = Application.prototype

exports = module.exports = Application

function Application() {
  this.reactHandlers = {}

  this.topLevelReact = null

  this.is_mounted = function() {
    return !!this.topLevelReact
  }
}

ns.middleware = []
ns.context = {}
ns.use = function(fn){
  if (!this.experimental) {
    // es7 async functions are allowed
    if (fn && 'GeneratorFunction' == fn.constructor.name) ; else
      throw new Error('app.use() requires a generator function')
  }
  this.middleware.push(fn)
  return this
}

ns.renderer = function() {
  var self = this
  return function* rerenderReact(next) {
    yield *next
    var newProps = {
      data: this.data
    , renderer: 'boa'
    , templateName: this.templateName
    , handlers: self.reactHandlers
    , path: this.path
    }
    self.topLevelReact.setProps(newProps)
  }
}

ns.callback = function(){
  var mw = [this.renderer()].concat(this.middleware)
  var fn = co.wrap(compose(mw))

  var self = this

  return function(context){
    return fn.call(Object.create(context))
  }
}

ns.mountReactComponent = function(TopLevelTemplate, id) {
  this.topLevelReact = React.render(
    <TopLevelTemplate
      handlers={this.reactHandlers}
    />
  , document.getElementById('html')
  )
}
