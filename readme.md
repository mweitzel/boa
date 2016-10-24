## boa.js

![rainbow-blend-banner](https://cloud.githubusercontent.com/assets/318925/19651026/4c5146f2-99d9-11e6-87cc-777ffafe729f.jpg)

Boa.js is browser-side middleware handler using generators. Like [koa](https://github.com/koajs/koa), but tied to to React and the DOM instead of node.

This library is an experiment which couples tightly to a koa.js app. It is intened is to use the same routes in a middleware architecture on both the server. If the site is static, you can ship the entire thing app to the client, where following pages are built, without interacting with the server.

On the server side, we'll build static html for the initial load, search engines, and js-disabled browsers.

You'll want something like the folling in your `server.js`:

```
var app = require('koa')()

var middleware = [
  server-specific-middleware // logging, etc.
, route-static-assets        // css, js, images, fonts, etc
, route-build-page           // html for first load, search engines, and js-disabled browsers
]

middleware.forEach(app.use.bind(app))
app.listen(process.env.PORT)
```

The `route-build-page.js` might something like:

```
React = require('react')

var htmlRender = require('./html-render')     // builds html from a single dynamic React template
  , compose = require('koa-compose')
  , clientRoutes = require('./client-routes') // this prepares data for react template


module.exports = compose(
  [renderTemplateAndDataToHTMLBody]
  .concat(clientRoutes)
)

function* renderTemplateAndDataToHTMLBody(next) {
  yield *next
  this.body = htmlRender(this.path, this.templateName, this.pageData)
  // the the `yield *next` first, this expects each `clientRoute` function
  // to attache `templateName` and `pageData` to the koa/boa context object
}
```

On the client side, you'll re-render the new path to respond to clicks, push, and pop state history.

It might look something like the following:

```
var require('url')
  , domready = require('domready')
  , FullSite = require('./react/fullsite.jsx')
  , Boa = require('./boa')
  , clientRoutes = require('./client-routes')

module.exports = domready.bind(this, onDomReady)

var app = new Boa()

function onDomReady() {
  configureBoa()

  app.mountReactComponent(FullSite, 'html')
  renderPath()
  
  window.onpopstate = onPopState
}

function configureBoa() {
  clientRoutes.forEach(function(route) { app.use(route) })
  setBoaHandlers()
}

function setBoaHandlers() {
  app.reactHandlers.onClick = onClick
}

function onClick(e){
  if(e.metaKey) { return }
  e.preventDefault()
  var href = e.target.href
  var path = url.parse(href).pathname
  if(href !== window.location.href)
    window.history.pushState({},"", path)
  renderPath(path)
  document.activeElement && document.activeElement.blur()
}
```

It is modelled to work almost identically to koa, only against the browser's api instead of node's.
