# open-stylable

Tiny (<0.5kB min+gz) proof-of-concept implementation of an ["open-stylable"](https://github.com/WICG/webcomponents/issues/909) web component. It can be styled from the global `<head>`, even though it uses shadow DOM.

So basically: styles leak in, but they don't leak out.

```html
<head>
  <style>div { color: red }</style>
</head>
<body>
  <my-component>
    #shadow-root
      <div>I'm red!</div>
  </my-component>
</body>
```

## Usage

Install:

    npm install open-stylable

Then use as a [mixin](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/):

```js
import { OpenStylable } from 'open-stylable'

class MyComponent extends OpenStylable(HTMLElement) {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' }).innerHTML = '<div>Hello world</div>'
  }
}
```

This custom element will use shadow DOM, but any styles from the `<head>` will be copied into its shadow root.

### `connectedCallback` and `disconnectedCallback`

If you use `connectedCallback` or `disconnectedCallback`, be sure to call `super`:

```js
class MyComponent extends OpenStylable(HTMLElement) {
  connectedCallback() {
    super.connectedCallback()
    /* Your code */
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    /* Your code */
  }
}
```

### In a framework

The `OpenStylable` mixin allows you to use whatever constructor you like. For instance, with a [Lit](https://lit.dev/) component:

```js
class MyComponent extends OpenStylable(LitElement) {
  /* ... */
}
```

## Limitations

This only works with open shadow DOM, not closed shadow DOM.

Also, it doesn't work with selectors that cross shadow boundaries, such as `body.foo *`.

Additionally, it only works for `<style>` and `<link rel="stylesheet">` tags in the `<head>`. More exotic ways of inserting styles, such as [`insertRule`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule) and [`document.adoptedStyleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets), are not supported.

Although it would be possible to support such things, it would increase the bundle size and require global patching, which is a big cost for a niche feature.

This implementation also uses [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver), which may have performance considerations if you have a lot of components and frequently-changing global styles.