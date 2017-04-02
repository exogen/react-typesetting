import React, { Component } from 'react'
import Head from 'next/head'
import styled from 'styled-components'

import Resizable from './Resizable'
import FontObserver from '../src/FontObserver'
import TightenText from '../src/TightenText'
import PreventWidows from '../src/PreventWidows'
import SmartCharacters from '../src/SmartCharacters'
import corpus from './corpus'

const FONTS = <link href='https://fonts.googleapis.com/css?family=Courgette|Libre+Baskerville:400,400i,700' rel='stylesheet' />
const STYLE = <style>{`
  body {
    margin: 0;
    padding: 50px 100px;
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 14px;
    line-height: 1.5;
    background: rgb(232, 230, 224);
    color: rgb(52, 50, 47);
  }

  @media (max-width: 800px) {
    body {
      padding: 1em 4%;
    }
  }

  code {
    font-family: Menlo, Consolas, Monaco, monospace;
  }

  a:link,
  a:visited {
    color: #1289de;
    text-decoration: none;
    padding-bottom: 1px;
    border-bottom: 1px solid rgba(18, 137, 222, 0.5);
  }

  .small-caps { font-family: 'Charter SC', serif }
  .pull-double { margin-left: -0.38em }
  .push-double { margin-right: 0.38em }
  .pull-single { margin-left: -0.15em }
  .push-single { margin-right: 0.15em }
  .pull-T, .pull-V, .pull-W, .pull-Y { margin-left: -0.07em }
  .push-T, .push-V, .push-W, .push-Y { margin-right: 0.07em }
  .pull-C, .pull-O, .pull-c, .pull-o { margin-left: -0.04em }
  .push-C, .push-O, .push-c, .push-o { margin-right: 0.04em }
  .pull-A { margin-left: -0.03em }
  .push-A { margin-right: 0.03em }
`}</style>

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
    display: ${props => props.arrow ? 'block' : 'none'}
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

const DemoInput = styled.input`
  font-size: 16px;
  padding: 0.5em;
`

class DemoResizable extends Component {
  render () {
    const { style, children, ...rest } = this.props
    return (
      <Resizable {...rest}
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
        {(width) => {
          return typeof children === 'function' ? children(width) : children
        }}
      </Resizable>
    )
  }
}

function DemoPreventWidows ({ minLineWidth, tip, children, ...rest }) {
  return (
    <div style={{ margin: '10px 8px 20px 0' }}>
      <DemoResizable {...rest}>
        {width => (
          <PreventWidows minLineWidth={minLineWidth} nbspChar={
            <span style={{ background: '#fd0' }}>{'\u00A0'}</span>
          }>
            {typeof children === 'function' ? children(width) : children}
          </PreventWidows>
        )}
      </DemoResizable>
      {tip}
    </div>
  )
}

const FIRST_TIP = 'Try resizing the container!'
const SECOND_TIP = 'Notice the non-breaking spaces (highlighted) are only inserted when necessary.'
const DEMO_FONTS = [
  { family: 'Libre Baskerville', weight: 400 },
  { family: 'Libre Baskerville', weight: 400, style: 'italic' },
  { family: 'Libre Baskerville', weight: 700 }
]

class App extends Component {
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
    const tip = width <= 258 ? SECOND_TIP : FIRST_TIP
    if (this.state.tip !== tip) {
      this.setState({ tip })
    }
  }

  render () {
    return (
      <FontObserver fonts={DEMO_FONTS}>
        {status => {
          return (
            <div className='App'>
              <Head>
                <title>react-typesetting</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {FONTS}
                {STYLE}
              </Head>

              <Heading>react-typesetting</Heading>

              <Subheading>{'<TightenText>'}</Subheading>
              <BodyParagraph>
                This short span of copy uses both <code>{'<TightenText>'}</code> and <code>
                  {'<PreventWidows>'}</code> to tighten up the <code>word-spacing</code>, <code>
                letter-spacing</code>, and <code>font-size</code> by small amounts if it will
                prevent a new line from forming. In addition, widow/orphan lines are fixed.
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
              <DemoPreventWidows initialWidth={770} minLineWidth={this.getMinLineWidth}>
                {corpus.JANE_EYRE}
              </DemoPreventWidows>
              <DemoPreventWidows initialWidth={525} minLineWidth={this.getMinLineWidth}>
                {corpus.METAMORPHOSIS}
              </DemoPreventWidows>
              <BodyParagraph>
                Until more advanced justification components are added for body text, <code>
                  {'<PreventWidows>'}</code> often works best with <code>text-align: justify</code>.
              </BodyParagraph>
              <DemoPreventWidows initialWidth={525} minLineWidth={this.getMinLineWidth} style={{
                textAlign: 'justify'
              }}>
                {corpus.MOBY_DICK}
              </DemoPreventWidows>
              <BodyParagraph>
                Since widow detection is based on a minimum line width, sometimes no adjustment
                is necessary even for single words.
              </BodyParagraph>
              <DemoPreventWidows initialWidth={390} minLineWidth={this.getMinLineWidth}>
                {corpus.ALICE_IN_WONDERLAND}
              </DemoPreventWidows>
              <Subheading>{'<FontObserver>'}</Subheading>
              <BodyParagraph>
                The <code>{'<FontObserver>'}</code> component can be given a list of fonts to
                monitor, and will re-render your children (provided as a function) with updates
                to the font status as they load. This is useful if you’re rendering components
                (like those above) that may need to recalculate their layout once the browser
                repaints them with the loaded fonts.
              </BodyParagraph>
              <FontObserver fonts={[
                ...DEMO_FONTS,
                'Courgette'
              ]}>
                {status => (
                  <div>
                    Loaded:
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {status.fonts.map(font => (
                        <li key={`${font.family}:${font.weight}:${font.style}:${font.stretch}`}>
                          {font.error ? '✘ ' : '✔ '}
                          <span style={{
                            fontFamily: font.family,
                            fontWeight: font.weight,
                            fontStyle: font.style
                          }}>
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
                This content was written with dumb quotes and dashes – but was transformed by
                {' '}<a href='https://blot.im/typeset/'>Typeset.js</a> to include beautiful typographic
                elements.
              </BodyParagraph>
              <DemoResizable initialWidth={570} style={{
                padding: '0.5em 1.5em',
                fontSize: 18
              }}>
                <SmartCharacters>
                  <div>
                    <p>
                      {`Yjarni Sigurðardóttir spoke to NATO from Iceland yesterday: "Light of my life, fire of my florins -- my sin, my soul. The tip of the tongue taking a trip to 118° 19' 43.5"."`}
                    </p>
                    <p>
                      "She's faster than a 120' 4" whale." <em>Piña co­ladas</em> were
                      widely consumed in Götterdämmerung from 1880–1912. For the low
                      price of $20 / year from Ex­hi­bits A–E... Then the <em>duplex</em> came
                      forward. "Thrice the tower, he mounted the round gunrest, 'awaking'
                      HTML. He can print a fixed num­ber of dots in a square inch (for
                      in­stance, 600 × 600)."
                    </p>
                  </div>
                </SmartCharacters>
              </DemoResizable>

            </div>
          )
        }}
      </FontObserver>
    )
  }
}

export default App
