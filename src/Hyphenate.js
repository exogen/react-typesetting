import React, { Component } from 'react'

export default class Hyphenate extends Component {
  render () {
    const { children } = this.props
    return <span style={{ hyphens: 'auto' }}>{children}</span>
  }
}
