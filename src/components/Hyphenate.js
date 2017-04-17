import React, { PureComponent } from 'react'

export default class Hyphenate extends PureComponent {
  render () {
    const { children } = this.props
    return <span style={{ hyphens: 'auto' }}>{children}</span>
  }
}
