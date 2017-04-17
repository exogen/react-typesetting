import React, { PureComponent } from 'react'
import styled from 'styled-components'
import Resizable from './Resizable'
import {
  FontObserver,
  TightenText,
  PreventWidows,
  SmartCharacters
} from '../src'
import corpus from './corpus'
import './App.css'

const _BodyParagraph = ({ className, children }) => (
  <p className={className}><PreventWidows>{children}</PreventWidows></p>
)

const BodyParagraph = styled(_BodyParagraph)`
  max-width: 56em;
`

const Tip = styled.div`
  display: inline-flex;
  align-items: center;
  position: relative;
  max-width: 16em;
  min-height: 4.5em;
  margin: 1em 1.5em;
  font-family: Courgette, sans-serif;
  font-size: 16px;
  vertical-align: middle;
  color: rgb(0, 116, 210);
  z-index: -1;

  &:before {
    display: ${props => (props.arrow ? 'block' : 'none')}
    position: absolute;
    right: 100%;
    top: 50%;
    margin-top: -0.75em;
    padding-right: 0.25em;
    content: '←';
  }

  @media (max-width: 800px) {
    display: block;
    min-height: 0;

    &:before {
      content: '↑';
    }
  }
`

const Heading = styled.h1`
  font-family: 'Libre Baskerville', Georgia, serif;
  font-weight: normal;
`

const Subheading = styled.h2`
  font-family: 'Libre Baskerville', Georgia, serif;
  font-weight: normal;
`

const DemoResizable = ({ style, children, ...rest }) => (
  <Resizable
    {...rest}
    style={{
      marginRight: 16,
      padding: '5px 0',
      background: '#ffffff',
      color: '#413e37',
      fontSize: 13,
      maxWidth: '100%',
      ...style
    }}
  >
    {children}
  </Resizable>
)

const DemoPreventWidows = ({ minLineWidth, tip, children, ...rest }) => (
  <div style={{ margin: '10px 8px 20px 0' }}>
    <DemoResizable {...rest}>
      {width => (
        <PreventWidows
          minLineWidth={minLineWidth}
          nbspChar={<span style={{ background: '#fd0' }}>&nbsp;</span>}
        >
          {typeof children === 'function' ? children(width) : children}
        </PreventWidows>
      )}
    </DemoResizable>
    {tip}
  </div>
)

const FIRST_TIP = 'Try resizing the container!'
const SECOND_TIP =
  'Notice the non-breaking spaces (highlighted) are only inserted when necessary.'
const DEMO_FONTS = [
  { family: 'Libre Baskerville', weight: 400 },
  { family: 'Libre Baskerville', weight: 400, style: 'italic' },
  { family: 'Libre Baskerville', weight: 700 }
]

class App extends PureComponent {
  state = {
    text: 'Islay <strong>single malt</strong> Scotch whisky',
    tip: FIRST_TIP
  }

  getMinLineWidth (data) {
    if (data.availableWidth < 200) {
      return '15%'
    }
    if (data.availableWidth < 800) {
      return '10%'
    }
    return 80
  }

  onResizeFirst = ({ width }) => {
    const tip = width <= 256 ? SECOND_TIP : FIRST_TIP
    if (this.state.tip !== tip) {
      this.setState({ tip })
    }
  }

  renderApp = () => {
    return (
      <div className='App'>
        <Heading>react-typesetting</Heading>

        <Subheading>{'<TightenText>'}</Subheading>
        <BodyParagraph>
          This short span of copy uses both <code>{'<TightenText>'}</code> and
          {' '}
          <code>{'<PreventWidows>'}</code>
          {' '}
          to tighten up the
          {' '}
          <code>word-spacing</code>
          ,
          {' '}
          <code>letter-spacing</code>
          , and
          {' '}
          <code>font-size</code>
          {' '}
          by small amounts if
          it will prevent a new line from forming. In addition, widow/orphan lines are
          fixed.
        </BodyParagraph>
        <DemoPreventWidows
          initialWidth={280}
          minLineWidth='33%'
          tip={<Tip arrow>{this.state.tip}</Tip>}
          onResize={this.onResizeFirst}
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            fontSize: 18
          }}
        >
          {() => (
            <TightenText>
              <span dangerouslySetInnerHTML={{ __html: this.state.text }} />
            </TightenText>
          )}
        </DemoPreventWidows>

        <Subheading>{'<PreventWidows>'}</Subheading>
        <BodyParagraph>
          Minimum line width can be given as an absolute value, percentage, or even
          a custom function (it will be passed information about the lines being rendered
          and their widths). The maximum number of adjustments can also be customized
          (it defaults to 3).
        </BodyParagraph>
        <DemoPreventWidows
          initialWidth={770}
          minLineWidth={this.getMinLineWidth}
        >
          {corpus.JANE_EYRE}
        </DemoPreventWidows>
        <DemoPreventWidows
          initialWidth={525}
          minLineWidth={this.getMinLineWidth}
        >
          {corpus.METAMORPHOSIS}
        </DemoPreventWidows>
        <BodyParagraph>
          Until more advanced justification components are added for body text,
          {' '}<code>{'<PreventWidows>'}</code> often works best with
          <code>text-align: justify</code>.
        </BodyParagraph>
        <DemoPreventWidows
          initialWidth={525}
          minLineWidth={this.getMinLineWidth}
          style={{
            textAlign: 'justify'
          }}
        >
          {corpus.MOBY_DICK}
        </DemoPreventWidows>
        <BodyParagraph>
          Since widow detection is based on a minimum line width, sometimes no adjustment
          is necessary even for single words.
        </BodyParagraph>
        <DemoPreventWidows
          initialWidth={390}
          minLineWidth={this.getMinLineWidth}
        >
          {corpus.ALICE_IN_WONDERLAND}
        </DemoPreventWidows>
        <Subheading>{'<FontObserver>'}</Subheading>
        <BodyParagraph>
          The
          {' '}
          <code>{'<FontObserver>'}</code>
          {' '}
          component can be given a list of fonts to
          monitor, and will re-render your children (provided as a function) with updates
          to the font status as they load. This is useful if you’re rendering components
          (like those above) that may need to recalculate their layout once the browser
          repaints them with the loaded fonts.
        </BodyParagraph>
        <FontObserver fonts={[...DEMO_FONTS, 'Courgette']}>
          {status => (
            <div>
              Loaded:
              <ul style={{ listStyle: 'none', paddingLeft: '1em' }}>
                {status.fonts.map(font => (
                  <li
                    key={`${font.family}:${font.weight}:${font.style}:${font.stretch}`}
                  >
                    {font.error ? '✘ ' : '✔ '}
                    <span
                      style={{
                        fontFamily: font.family,
                        fontWeight: font.weight,
                        fontStyle: font.style
                      }}
                    >
                      {font.family}
                      {font.weight ? ` • ${font.weight}` : ''}
                      {font.style ? ` • ${font.style}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </FontObserver>

        <Subheading>{'<SmartCharacters>'}</Subheading>
        <BodyParagraph>
          This content was written with dumb quotes and dashes –&nbsp;but was transformed by
          {' '}
          <a href='https://blot.im/typeset/'>Typeset.js</a>
          {' '}
          to include beautiful typographic
          elements.
        </BodyParagraph>
        <BodyParagraph>
          ⚠️ This currently has absurd dependencies from Typeset.js and uses
          {' '}
          <code>__dangerouslySetInnerHTML</code>
          .
          Wait for it to be reimplemented in React. Seriously, don’t use this. It’s just a demo.
        </BodyParagraph>
        <DemoResizable
          initialWidth={570}
          style={{
            padding: '0.5em 1.5em',
            fontSize: 18
          }}
        >
          <SmartCharacters>
            <div>
              {corpus.TYPESET_DEMO_1}
              {corpus.TYPESET_DEMO_2}
            </div>
          </SmartCharacters>
        </DemoResizable>
      </div>
    )
  }

  render () {
    return (
      <FontObserver fonts={DEMO_FONTS}>
        {this.renderApp}
      </FontObserver>
    )
  }
}

export default App
