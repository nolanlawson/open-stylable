# open-stylable

Proof-of concept implementation of an ["open-stylable"](https://github.com/WICG/webcomponents/issues/909) web component. Uses shadow DOM, but inherits all styles defined in the global `<head>`.

So basically: styles leak in, but they don't leak out.

```html
<head>
<style>div { color: red }</style>
</head>
<my-component>
  #shadow-root
    <div>Magically, I am red!</div>
</my-component>
```

## Usage

Install:

    npm install open-stylable

Then use as a [mixin](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/):

```js
import { OpenStylable } from 'open-stylable'

customElements.define('my-component', class extends OpenStylable(HTMLElement) {
  constructor() {
    this.attachShadow({ mode: 'open' }).innerHTML = '<div>Hello world</div>'
  }
})
```

This custom element will use shadow DOM, but any styles from the `<head>` will be copied into its shadow root.

### In a framework like Lit

The mixin allows you to use whatever constructor you like. For instance, with a [Lit](https://lit.dev/) component:

```js
customElements.define('my-component', class extends OpenStylable(LitElement) {
  /* ... */
})
```

## Limitations

This only works with open shadow DOM, not closed shadow DOM.

Additionally, it only currently works for `<style>` and `<link rel="stylesheet">` in the `<head>`. More exotic ways of inserting styles, such as [`insertRule`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule) and [`document.adoptedStyleSheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets), are not supported.

Although it would be possible to support such things, it would increase the bundle size and require global patching, which is a big cost for a niche feature.