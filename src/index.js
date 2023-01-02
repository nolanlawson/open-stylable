/* global MutationObserver */

let globalStyles
const openStylableElements = new Set()
const elementsToAnchors = new WeakMap()
const delayedConnectedCallbackElements = new WeakSet()
const constructableStylesheets = new WeakMap()
window.__constructableStylesheets = constructableStylesheets

// Use empty text nodes to know the start and end anchors of where we should insert cloned styles
function getAnchors (element) {
  let anchors = elementsToAnchors.get(element)
  if (!anchors) {
    anchors = [document.createTextNode(''), document.createTextNode('')]
    elementsToAnchors.set(element, anchors)
    element.shadowRoot.prepend(...anchors)
  }
  return anchors
}

function clearStyles (element) {
  const [startAnchor, endAnchor] = getAnchors(element)
  let nextSibling
  while ((nextSibling = startAnchor.nextSibling) !== endAnchor) {
    nextSibling.remove()
  }
}

function getConstructableStylesheet(node) {
  let sheet = constructableStylesheets.get(node)
  if (!sheet) {
    sheet = new CSSStyleSheet()
    sheet.replaceSync(node.textContent)
    constructableStylesheets.set(node, sheet)
  }
  return sheet
}

function setStyles (element) {
  const [, endAnchor] = getAnchors(element)
  for (const node of globalStyles) {
    const sheet = getConstructableStylesheet(node)
    element.shadowRoot.adoptedStyleSheets.push(sheet)
    // element.shadowRoot.insertBefore(node.cloneNode(true), endAnchor)
  }
}

function updateGlobalStyles () {
  globalStyles = document.head.querySelectorAll('style,link[rel="stylesheet"]')
}

const observer = new MutationObserver(() => {
  updateGlobalStyles()
  for (const element of openStylableElements) {
    clearStyles(element)
    setStyles(element)
  }
})
observer.observe(document.head, {
  childList: true,
  subtree: true
})

updateGlobalStyles()

export const OpenStylable = superclass => (class extends superclass {
  connectedCallback () {
    try {
      if (super.connectedCallback) {
        super.connectedCallback()
      }
    } finally {
      openStylableElements.add(this)
      if (this.shadowRoot) {
        setStyles(this)
      } else { // if shadowRoot doesn't exist yet, wait to see if it gets added in connectedCallback
        delayedConnectedCallbackElements.add(this) // keep track of which elements needed a delay
        Promise.resolve().then(() => setStyles(this))
      }
    }
  }

  disconnectedCallback () {
    try {
      if (super.disconnectedCallback) {
        super.disconnectedCallback()
      }
    } finally {
      openStylableElements.delete(this)
      if (delayedConnectedCallbackElements.has(this)) { // ensure our disconnected logic runs after our connected logic
        Promise.resolve().then(() => clearStyles(this))
      } else { // run immediately, no need to delay
        clearStyles(this)
      }
    }
  }
})
