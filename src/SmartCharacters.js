import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import typeset from 'typeset'
import { iterTextNodesReverse, replaceNodeWithText, replaceTextInNode } from './util'

const EM_DASH = '—'
const EN_DASH = '–'
const SKIP_TAGS = {
  CODE: true,
  SCRIPT: true,
  STYLE: true,
  PRE: true,
  TEXTAREA: true
}

export default class SmartCharacters extends Component {
  static PropTypes = {
    replacer: PropTypes.func
  }

  state = {
    innerHTML: null
  }

  componentDidMount () {
    const node = ReactDOM.findDOMNode(this)
    if (node) {
      this.applySmartCharacters(node)
    }
  }

  componentDidUpdate () {
    const node = ReactDOM.findDOMNode(this)
    if (node) {
      // this.applySmartCharacters(node)
    }
  }

  componentWillUnmount () {
    this.replacementNodes = null
  }

  applySmartCharacters (node) {
    const temp = document.createElement('div')
    const output = typeset(node.outerHTML, { disable: ['hyphenate'] })
    temp.innerHTML = output
    this.setState({ innerHTML: temp.childNodes[0].innerHTML })
  }

  defaultReplacer = (chars) => {
    return this.createTextWrapper('span', null, chars)
  }

  findNextMatch (text) {
    for (let i = 0; i < DEFAULT_RULES.length; i++) {
      const [ regex, replacement ] = DEFAULT_RULES[i]
      const match = text.match(regex)
      if (match) {
        return [match[1], match.index, replacement]
      }
    }
  }

  createTextWrapper (tagName, attrs, innerText) {
    const node = document.createElement(tagName)
    node.appendChild(document.createTextNode(innerText))
    if (attrs) {
      for (const key in attrs) {
        const value = attrs[key]
        if (value != null) {
          node.setAttribute(key, value)
        }
      }
    }
    return node
  }

  render () {
    const { children } = this.props
    const { innerHTML } = this.state
    if (innerHTML == null) {
      return React.Children.only(children)
    } else {
      const props = { dangerouslySetInnerHTML: { __html: innerHTML } }
      return React.cloneElement(children, props, null)
    }
  }
}
