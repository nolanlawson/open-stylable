/* global it, before, beforeEach, afterEach, getComputedStyle, customElements, HTMLElement, CSSStyleSheet */
import { expect } from '@esm-bundle/chai'
import { OpenStylable } from '../src/index.js'

let element

before(() => {
  customElements.define('x-basic', class extends OpenStylable(HTMLElement) {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' }).innerHTML = '<div>hello</div>'
    }
  })
})

beforeEach(() => {
  element = document.createElement('x-basic')
  document.body.appendChild(element)
})

afterEach(() => {
  for (const node of [...document.body.children]) {
    if (node.tagName !== 'SCRIPT') { // added by test runner
      node.remove()
    }
  }
  for (const node of [...document.head.querySelectorAll('style,link[rel="stylesheet"]')]) {
    node.remove()
  }
  document.adoptedStyleSheets = []
})

function createConstructableStyleSheet (content) {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(content)
  return sheet
}

function addStyleTag (content) {
  const style = document.createElement('style')
  style.textContent = content
  document.head.appendChild(style)
}

it('unstyled by default', async () => {
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 0)')
})

it('can style an element', async () => {
  addStyleTag('div { color: red }')

  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
})

it('can re-style an element', async () => {
  addStyleTag('div { color: red }')

  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')

  for (const node of [...document.head.querySelectorAll('style')]) {
    node.remove()
  }

  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 0)')
})

it('works with link rel stylesheet', async () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'data:text/css,' + encodeURIComponent('div { color: green }')
  document.head.appendChild(link)
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 128, 0)')
})

it('works if style is modified', async () => {
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')
  document.head.querySelector('style').textContent = 'div { color: red }'
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
})

it('works if shadow root is attached in connected callback - framework style', async () => {
  // mimic how lit calls attachShadow in connectedCallback
  class FrameworkElement extends HTMLElement {
    connectedCallback () {
      this.attachShadow({ mode: 'open' }).innerHTML = '<div>hello</div>'
    }
  }

  customElements.define('x-framework', class extends OpenStylable(FrameworkElement) {})
  const element = document.createElement('x-framework')
  document.body.appendChild(element)
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')
})

it('works if shadow root is attached in connected callback - standalone style', async () => {
  customElements.define('x-connected', class extends OpenStylable(HTMLElement) {
    connectedCallback () {
      super.connectedCallback()
      this.attachShadow({ mode: 'open' }).innerHTML = '<div>hello</div>'
    }
  })
  const element = document.createElement('x-connected')
  document.body.appendChild(element)
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')
})

it('styles removed when disconnected', async () => {
  addStyleTag('div { color: red }')
  await Promise.resolve()
  expect(element.shadowRoot.querySelectorAll('*').length).to.equal(2) // has a <style>
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
  document.body.removeChild(element)
  await Promise.resolve()
  expect(element.shadowRoot.querySelectorAll('*').length).to.equal(1) // no <style>
  document.body.appendChild(element)
  await Promise.resolve()
  expect(element.shadowRoot.querySelectorAll('*').length).to.equal(2) // has a <style> again
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
})

it('works with own styles', async () => {
  customElements.define('x-ownstyles', class extends OpenStylable(HTMLElement) {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' }).innerHTML = '<style>div { color: red }</style><div>hello</div>'
    }
  })
  const element = document.createElement('x-ownstyles')
  document.body.appendChild(element)
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
  addStyleTag('div { color: blue; background-color: green }')
  // global styles go before local styles
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).backgroundColor).to.equal('rgb(0, 128, 0)')
})

it('calls connected / disconnected callbacks', async () => {
  let calledConnected
  let calledDisconnected
  class Super extends HTMLElement {
    connectedCallback () {
      calledConnected = true
    }

    disconnectedCallback () {
      calledDisconnected = true
    }
  }

  customElements.define('x-callbacks', class extends OpenStylable(Super) {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' }).innerHTML = '<div>hello</div>'
    }
  })
  const element = document.createElement('x-callbacks')
  document.body.appendChild(element)
  document.body.removeChild(element)
  expect(calledConnected).to.equal(true)
  expect(calledDisconnected).to.equal(true)
})

// TODO: implement this
it.skip('works with insertRule', async () => {
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')
  const sheets = [...document.styleSheets]
  sheets.at(-1).insertRule('div { color: red } ')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
})

// TODO: implement this
it.skip('works with adopted style sheets', async () => {
  document.adoptedStyleSheets = [createConstructableStyleSheet('div { color: red }')]
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
  document.adoptedStyleSheets.push(createConstructableStyleSheet('div { color: green }'))
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 128, 0)')
  document.adoptedStyleSheets.splice(1, 1)
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(255, 0, 0)')
})
