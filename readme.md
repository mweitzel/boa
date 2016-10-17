## boa.js

Browser-side middleware using generators. Like [koa](https://github.com/koajs/koa), but tied to to React and the DOM instead of node.

This library is an experiment to pair with a koa.js app. Its intent is to use the same routes in a middleware architecture on both the server.
If this is a static site, you can ship the entire app the the client, where following page-loads are built there.

On the server side, to you'll want to build static html. You'll want something like the folling in your `server.js`:

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

The `route-build-page.js` might something like

```
React = require('react')

var htmlRender = require('./html-render')     // builds html from a single dynamic React template
  , compose = require('koa-compose')
  , clientRoutes = require('./client-routes') // this prepares data for react template
  // each `clientRoute` attaches `templateName` and `pageData` to the koa/boa context object

module.exports = compose(
  [renderTemplateAndDataToHTMLBody]
  .concat(clientRoutes)
)

function* renderTemplateAndDataToHTMLBody(next) {
  yield *next
  this.body = htmlRender(this.path, this.templateName, this.pageData)
}
```

On the client side, you'll need to handle push and pop state history, and re-renders with a new path on clicks.

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
