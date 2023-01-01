
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
  let anchors = getAnchors(element)
  let nextSibling
  while ((nextSibling = anchors[0].nextSibling) !== anchors[1]) {
    nextSibling.remove()
  }
}


function setStyles(element) {
  let anchors = getAnchors(element)
  for (const node of [...globalStyles.content.children].reverse()) {
    element.shadowRoot.insertBefore(node, anchors[1])
  }
}

function updateGlobalStyles() {
  globalStyles = document.createElement('template')
  for (const node of document.head.querySelectorAll('style,link[rel="stylesheet"]')) {
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
  attributes: true
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
        openStylableElements.remove(this)
        clearStyles(this)
      }
    }
  }
}