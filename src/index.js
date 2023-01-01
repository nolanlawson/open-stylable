
let globalStyles
const openStylableElements = new Set()
const elementsToAnchors = new WeakMap()

function getAnchors(element) {
  let anchors = elementsToAnchors.get(element)
  if (!anchors) {
    anchors = [document.createTextNode(''), document.createTextNode('')]
    elementsToAnchors.set(element, anchors)
    element.shadowRoot.prepend(...anchors)
  }
  return anchors
}

function clearStyles(element) {
  let [startAnchor, endAnchor] = getAnchors(element)
  let nextSibling
  while ((nextSibling = startAnchor.nextSibling) !== endAnchor) {
    nextSibling.remove()
  }
}

function setStyles(element) {
  let [, endAnchor] = getAnchors(element)
  for (const node of [...globalStyles.content.children]) {
    element.shadowRoot.insertBefore(node, endAnchor)
  }
}

function updateGlobalStyles() {
  globalStyles = document.createElement('template')
  for (const node of [...document.head.querySelectorAll('style,link[rel="stylesheet"]')]) {
    globalStyles.content.appendChild(node.cloneNode(true))
  }
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
  subtree: true,
  attributes: true,
  characterData: true
})

updateGlobalStyles()

export const OpenStylable = superclass => {
  return class extends superclass {
    connectedCallback() {
      try {
        if (super.connectedCallback) {
          super.connectedCallback()
        }
      } finally {
        openStylableElements.add(this)
        setStyles(this)
      }
    }

    disconnectedCallback() {
      try {
      if (super.disconnectedCallback) {
        super.disconnectedCallback()
      }
        } finally {
        openStylableElements.delete(this)
        clearStyles(this)
      }
    }
  }
}