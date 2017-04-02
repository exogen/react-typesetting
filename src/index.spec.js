import * as ReactTypesetting from './index'
import { expect } from 'chai'

describe('index', () => {
  it('exports FontObserver', () => {
    expect(ReactTypesetting.FontObserver).to.be.a('function')
  })
  it('exports TightenText', () => {
    expect(ReactTypesetting.TightenText).to.be.a('function')
  })
  it('exports PreventWidows', () => {
    expect(ReactTypesetting.PreventWidows).to.be.a('function')
  })
  it('exports SmartCharacters', () => {
    expect(ReactTypesetting.SmartCharacters).to.be.a('function')
  })
})
