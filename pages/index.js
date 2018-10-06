import React from "react";
import Head from "next/head";
import styled, { createGlobalStyle } from "styled-components";
import Resizable from "../demo/Resizable";
import { TightenText, PreventWidows, FontObserver } from "../src";

const VisibleSpace = styled.span.attrs({
  children: props => "\u00a0",
  title: "non-breaking space inserted by <PreventWidows>"
})`
  background: rgb(255, 230, 3);
`;

const GlobalStyle = createGlobalStyle`
    html {
      font-size: 16px;
    }

    body {
      margin: 0;
      padding: 50px 100px;
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 1rem;
      line-height: 1.7;
      text-rendering: optimizeLegibility;
      background: rgb(232, 230, 224);
      color: rgb(52, 50, 47);
    }

    code {
      font-family: Menlo, Monaco, Consolas, 'Source Sans Pro', monospace;
      padding: 2px 4px;
      border-radius: 2px;
      background: rgba(74, 65, 59, 0.1);
      color: rgb(66, 64, 60);
    }

    abbr {
      font-size: 0.9em;
      letter-spacing: -0.01em;
    }

    p {
      text-align: justify;
    }

    a:link {
      color: rgb(0, 70, 162);
    }

    a:visited {
      color: rgb(54, 36, 140);
    }
  `;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: normal;
`;

const DemoResizable = styled(Resizable)`
  font-size: ${18 / 16}rem;
  line-height: 1.4;
  margin-bottom: 40px;
  padding: 0.25em 0;
  background: #fff;
`;

export default class App extends React.Component {
  render() {
    return (
      <>
        <GlobalStyle />
        <Head>
          <title>
            react-typesetting ❧ React components for creating beautifully
            typeset designs
          </title>
        </Head>
        <FontObserver.Provider
          fonts={[
            "Courgette",
            { family: "Libre Baskerville", weight: 400 },
            { family: "Libre Baskerville", weight: 400, style: "italic" },
            { family: "Libre Baskerville", weight: 700 }
          ]}
        >
          <main style={{ fontFamily: "Libre Baskerville", width: "60ch" }}>
            <PageTitle>react-typesetting</PageTitle>

            <p>
              <PreventWidows>
                This page is a demonstration of{" "}
                <a
                  href="https://github.com/exogen/react-typesetting"
                  rel="noopener"
                  target="_blank"
                >
                  react-typesetting
                </a>
                , a collection of React components for projects that emphasize
                text-heavy design.
              </PreventWidows>
            </p>

            <section>
              <SectionTitle>&lt;TightenText&gt;</SectionTitle>

              <p>
                <PreventWidows>
                  The <code>TightenText</code> component is intended to give
                  short runs of text (like titles, labels, etc.) some “give”
                  before wrapping. This is useful when you want to prioritize
                  having fewer lines of text over having completely rigid visual
                  tightness.
                </PreventWidows>
              </p>
              <p>
                <PreventWidows>
                  When a line is just slightly too long for the available space,
                  the text will be set tighter by a barely perceptible amount to
                  avoid wrapping. By default, adjustments are made to word
                  spacing, letter spacing, and font size (preferentially in that
                  order).
                </PreventWidows>
              </p>
              <p>
                <PreventWidows>
                  Try dragging to adjust the available space for this line from
                  a cocktail recipe:
                </PreventWidows>
              </p>

              <DemoResizable initialWidth={320}>
                <TightenText>Islay single malt Scotch whisky</TightenText>
              </DemoResizable>

              <p>
                <PreventWidows>
                  Notice that the text resists both wrapping (when a new line
                  would be formed) and overflowing (when the words can’t be
                  broken any more) – up to a certain point.
                </PreventWidows>
              </p>
            </section>

            <section>
              <SectionTitle>&lt;PreventWidows&gt;</SectionTitle>

              <p>
                <PreventWidows>
                  Although the terminology varies, “widows” often refer to very
                  short lines of text at the end of paragraphs. This tends to be
                  undesirable during typesetting, as it gives the appearance of
                  too much whitespace between the paragraph and any elements
                  that follow, and can be distracting. It is generally
                  preferable to find a way to either remove the extra line (
                  <em>a la</em> <code>TightenText</code>) or make it longer. If
                  possible, you can even just opt to reword your writing.
                </PreventWidows>
              </p>

              <p>
                <PreventWidows>
                  Many <abbr>HTML</abbr> typesetting helpers implement this in a
                  naïve way – for example, by always joining the last word with
                  a{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/Non-breaking_space"
                    rel="noopener"
                    target="_blank"
                  >
                    non-breaking space
                  </a>
                  . This gives poor results, since it does not account for how
                  long the last line actually is. Try the naïve approach to see
                  how it fails to achieve the desired wrapping:
                </PreventWidows>
              </p>

              <DemoResizable initialWidth={200}>
                The Long&nbsp;Goodbye
              </DemoResizable>

              <p>
                <PreventWidows>
                  The <code>PreventWidows</code> component instead works by
                  actually measuring the widths of lines, and can thus support
                  many different ways to specify the desired minimum width –
                  including percentages, pixels, and ems. The default minimum is
                  15% of the available width.
                </PreventWidows>
              </p>

              <p>
                <PreventWidows>
                  In this demo, a custom <code>nbspChar</code> element is
                  supplied that highlights the inserted spaces for demonstration
                  purposes:
                </PreventWidows>
              </p>

              <DemoResizable initialWidth={440}>
                <PreventWidows nbspChar={<VisibleSpace />}>
                  Call me Ishmael. Some years ago—never mind how long
                  precisely—having little or no money in my purse, and nothing
                  particular to interest me on shore, I thought I would sail
                  about a little and see the watery part of the world. It is a
                  way I…
                </PreventWidows>
              </DemoResizable>
            </section>

            <p>
              <PreventWidows>
                The current strategy works especially well with justified text,
                since there is no rag on the preceding line to worry about:
              </PreventWidows>
            </p>

            <DemoResizable
              initialWidth={600}
              style={{
                fontSize: 15,
                textAlign: "justify"
              }}
            >
              <PreventWidows nbspChar={<VisibleSpace />}>
                One morning, when Gregor Samsa woke from troubled dreams, he
                found himself transformed in his bed into a horrible vermin. He
                lay on his armour-like back, and if he lifted his head a little
                he could see his brown belly, slightly domed and divided by
                arches into stiff sections. The bedding was hardly able to cover
                it and seemed ready to slide off any moment. His many legs,
                pitifully thin compared with the size of the rest of him, waved
                about helplessly as he looked.
              </PreventWidows>
            </DemoResizable>

            <section>
              <SectionTitle>&lt;FontObserver&gt;</SectionTitle>

              <p>
                <PreventWidows>
                  When creating pages with typographically important features,
                  sometimes you’ll want to know when your custom fonts are done
                  loading. Perhaps you’ve done some rendering calculations that
                  are influenced by font metrics (like how wide a line of text
                  is) and thus need to recompute them when your font is shown?
                  The components above are great examples of this.
                </PreventWidows>
              </p>
              <p>
                <PreventWidows>
                  The <code>FontObserver</code> component offers an interface to
                  this information. By supplying{" "}
                  <code>FontObserver.Provider</code> a list of fonts to observe,
                  it will use{" "}
                  <a
                    href="https://fontfaceobserver.com"
                    rel="noopener"
                    target="_blank"
                  >
                    Font Face Observer
                  </a>{" "}
                  to populate a React context provider with status information
                  for each font. You can then use <code>FontObserver</code>{" "}
                  anywhere in the subtree to get updates.
                </PreventWidows>
              </p>

              <p>
                <PreventWidows>
                  Below is a list of the fonts used on this page, rendered using
                  data from <code>FontObserver</code>. The symbol rendered next
                  to each font is based on the <code>loaded</code> and{" "}
                  <code>error</code> properties that are populated for each
                  font.
                </PreventWidows>
              </p>

              <ul style={{ listStyle: "none", padding: 0 }}>
                <FontObserver>
                  {({ fonts }) =>
                    fonts.map((font, i) => (
                      <li key={i}>
                        {font.loaded ? "✔︎" : font.error ? "✘" : "…"}{" "}
                        <span
                          style={{
                            fontFamily: font.family,
                            fontWeight: font.weight,
                            fontStyle: font.style,
                            fontStretch: font.stretch
                          }}
                        >
                          {font.family}
                          {font.weight ? ` • ${font.weight}` : ""}
                          {font.style ? ` • ${font.style}` : ""}
                          {font.stretch ? ` • ${font.stretch}` : ""}
                        </span>
                      </li>
                    ))
                  }
                </FontObserver>
              </ul>
            </section>
            <section>
              <SectionTitle>Documentation</SectionTitle>
              <p>
                All options are documented in the{" "}
                <a
                  href="https://github.com/exogen/react-typesetting"
                  rel="noopener"
                  target="_blank"
                >
                  README
                </a>
                .
              </p>
            </section>
          </main>
        </FontObserver.Provider>
      </>
    );
  }
}
