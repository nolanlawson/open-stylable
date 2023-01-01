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
})

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

it.only('can re-style an element', async () => {
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