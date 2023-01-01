import { expect } from '@esm-bundle/chai';
import { OpenStylable } from '../src/index.js'

let element

before(() =>{
  customElements.define('x-basic', class extends OpenStylable(HTMLElement) {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' }).innerHTML = '<div>hello</div>'
    }
  })
})

beforeEach(() => {
  element = document.createElement('x-basic')
  document.body.appendChild(element)
})

afterEach(() =>{
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

function createConstructableStyleSheet(content) {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(content)
  return sheet
}

function addStyleTag(content) {
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

// TODO: implement this
it.skip('works with insertRule', async () => {
  addStyleTag('div { color: blue }')
  await Promise.resolve()
  expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).to.equal('rgb(0, 0, 255)')
  const sheets = [...document.styleSheets]
  sheets.at(-1).insertRule('div { color: red } ')
  await Promise.resolve()
  debugger
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