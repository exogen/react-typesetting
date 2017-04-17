# Components

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [FontObserver](#fontobserver)
  - [Examples](#examples)
  - [Props](#props)
- [Hyphenate](#hyphenate)
- [PreventWidows](#preventwidows)
  - [Examples](#examples-1)
  - [Props](#props-1)
- [SmartCharacters](#smartcharacters)
- [TightenText](#tightentext)
  - [Props](#props-2)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- START component-docs -->

## FontObserver

Detect when fonts load using the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
library under the hood. This is useful if you are rendering custom fonts
within any components that need to compute text metrics such as line width
(like several of the components in this library). In such cases, you want
those components to re-render once the font has been applied, so their
metrics are up to date.

### Examples

Re-render a child element as each font loads (or times out). Note that this
is only useful if the child component needs to compute text metrics after it
renders, and is allowed by the components `shouldComponentUpdate` method.

```jsx
<FontObserver fonts={[
  { family: 'Lato', weight: 400 },
  { family: 'Lato', weight: 700 }
]}>
  <TightenText>This Headline Uses <strong>Custom Fonts</strong>!</TightenText>
</FontObserver>
```

Notify the rendering component when all fonts have loaded (or timed out).
If the handler calls `setState`, then even components not wrapped by
`FontObserver` will potentially be re-rendered (if their `shouldComponentUpdate`
methd allows it).


```jsx
<FontObserver onDone={this.handleFontsDone} fonts={APP_FONTS} />
<Header />
<Body />
<Footer />
```

Render a loading state until all fonts have loaded (or timed out):

```jsx
<FontObserver fonts={APP_FONTS}>
  {status => status.done ? <App /> : <p>Loading…</p>}
</FontObserver>
```

Render a list of the loaded fonts:

```jsx
<FontObserver fonts={APP_FONTS}>
  {status => status.fonts.map((font, i) => (
    <ul>
      <li key={i}>
        {font.error ? '✘ ' : '✔ '}
        {font.family}
        {font.weight ? ` • ${font.weight}` : ''}
        {font.style ? ` • ${font.style}` : ''}
      </li>
    </ul>
  ))}
</FontObserver>
```

### Props

<table>
<thead>
<tr>
<th>Name</th>
<th colspan="2">Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top" rowspan="6"><strong title="Required">fonts</strong></td>
<td valign="top" colspan="2">
Array of… <br>
&nbsp;&nbsp;One of… <br>
&nbsp;&nbsp;&nbsp;&nbsp;String <br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="#shape-1" title="{ family, weight, style, stretch }">Object&thinsp;<sup>1</sup></a>
</td>
<td valign="top" align="right" rowspan="6"></td>
<td valign="top" valign="top" rowspan="6">

The font faces to detect.

* **String** values specify the font family name. This is sufficient if
  you are using only the family’s `normal` weight, style, and stretch
  values. Otherwise, you should list each style individually (see below)
  to truly detect when the full set of fonts has loaded.
* **Object** values must specify at least a `family`, and optionally
  `weight`, `style`, and `stretch` properties.

</td>
</tr>
<tr><td colspan="2"><a name="shape-1"><sup>1</sup>&thinsp;Object</a></td></tr>
<tr><td valign="top"><strong title="Required">family</strong></td><td valign="top">String</td></tr>
<tr><td valign="top">weight</td><td valign="top">One of… <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;Number</td></tr>
<tr><td valign="top">style</td><td valign="top">String</td></tr>
<tr><td valign="top">stretch</td><td valign="top">String</td></tr>
<tr>
<td valign="top" rowspan="1">timeout</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Duration (in milliseconds) after which a font is considered to have
failed loading. If not provided, the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
library will implicity use its own default.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">testString</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Test string to use for detecting if a font is available. If not provided,
the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
library will implicitly use its own default.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onLoad</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Function to call every time a font in the list has successfully loaded.
It will be called with the full state of the `FontObserver` component
(see the `children` prop).

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onError</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Function to call every time a font in the list has failed to load.
It will be called with the full state of the `FontObserver` component
(see the `children` prop).

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onDone</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Function to call once every font in the list has either loaded or failed.
It will be called with the full state of the `FontObserver` component
(see the `children` prop).

</td>
</tr>
<tr>
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Function <br>
&nbsp;&nbsp;React&nbsp;Element
</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A function or React Element to re-render on every font update.

**Function** values will be called with an object useful for determining
the status of the requested fonts:

```js
{
  // The fonts loaded so far. They’ll be in the order
  // loaded, not the order provided to `FontObserver`.
  fonts: [{
    family: 'Lato', weight: 400, error: false
  }],
  // Whether any font failed to load.
  error: false,
  // Whether all fonts have either loaded or failed.
  done: true
}
```

**React Element** values must be a single child to re-render on every
font update. No extra props regarding the font status are passed to the
child – if you need this, use a function (see above).

</td>
</tr>
</tbody>
</table>

## Hyphenate


## PreventWidows

Avoid rendering a very short last line of text (whether created by a single
word or several very short words).

### Examples

Use the defaults: a minimum final line width of 10% of the longest line.

```jsx
<h1>
  <PreventWidows>
    It This Headline Has Some Short Words, Then So Be It
  </PreventWidows>
</h1>
```

Specify a custom minimum width:

```jsx
<p>
  <PreventWidows minLineWidth="30%">
    Higher percentages make sense for shorter width elements.
  </PreventWidows>
</p>
```

Specify a dynamic minimum width:

```jsx
<p>
  <PreventWidows minLineWidth={metrics => {
    if (metrics.longestLineWidth < 300) {
      return '15%'
    } else if (metrics.longestLineWidth < 800) {
      return '10%'
    } else {
      return 80
    }
  }}>
    Lorem ipsum dolor sit amet…
  </PreventWidows>
</p>
```

Render a custom non-breaking space wrapper during development so you can
visualize how it’s working:

```jsx
<p>
  <PreventWidows nbspChar={<span style={{ background: '#fd0' }}>&nbsp;</span>}>
    Lorem ipsum dolor sit amet…
  </PreventWidows>
</p>
```

### Props

<table>
<thead>
<tr>
<th>Name</th>
<th colspan="2">Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top" rowspan="1"><strong title="Required">minLineWidth</strong></td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;Function
</td>
<td valign="top" align="right" rowspan="1">10%</td>
<td valign="top" valign="top" rowspan="1">

The minimum width of the last line, below which non-breaking spaces will
be inserted until the minimum is met.

* **Numbers** are treated as absolute pixel widths.
* **Strings** must be numbers ending with `%` or `px`. Percentage values
  are determined as a percentage of the longest line.
* **Functions** will be called with relevant data to determine a dynamic
  number or string value to return. This can be used, for example, to
  have different rules at different breakpoints – like a media query.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">maxSpaces</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">3</td>
<td valign="top" valign="top" rowspan="1">

The maximum number of spaces to be substituted for non-breaking spaces.
If this number is reached, no more adjustments will be made, even if the
line is too short.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">nbspChar</strong></td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;React&nbsp;Element <br>
&nbsp;&nbsp;Function
</td>
<td valign="top" align="right" rowspan="1"><code title="non-breaking space">\u00A</code></td>
<td valign="top" valign="top" rowspan="1">

A character or element to use when substituting spaces. Defaults to a
standard non-breaking space character, which you should almost certainly
stick with unless you want to visualize where non-breaking spaces are
being inserted (during development) or adjust their width.

* **String** values will be inserted directly into existing Text nodes.
* **React Element** values will be rendered into an in-memory “incubator”
  node, then transplanted into the DOM, splitting up the Text node in
  which the space was found.
* **Function** values must produce a string, Text node, Element node, or
  React Element to insert.

</td>
</tr>
</tbody>
</table>

## SmartCharacters

⚠️ Work in progress. The current implementation is absurd and has lame
dependencies like jQuery. Seriously, don’t use this.


## TightenText

Tighten the spacing and font size of a run of text to prevent wrapping lines.
If a new line can be avoided by compressing the text, the spacing

### Props

<table>
<thead>
<tr>
<th>Name</th>
<th colspan="2">Type</th>
<th>Default</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top" rowspan="1"><strong title="Required">minFontSize</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">96</td>
<td valign="top" valign="top" rowspan="1">

Minimum `font-size` as a percentage.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">minLetterSpacing</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">-0.03</td>
<td valign="top" valign="top" rowspan="1">

Minimum `letter-spacing` value in ems.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">minWordSpacing</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">-0.03</td>
<td valign="top" valign="top" rowspan="1">

Minimum `word-spacing` value in ems.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">fontSizeStep</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">0.25</td>
<td valign="top" valign="top" rowspan="1">

Difference between consecutive `font-size` values.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">letterSpacingStep</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">0.0025</td>
<td valign="top" valign="top" rowspan="1">

Difference between consecutive `letter-spacing` values.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">wordSpacingStep</strong></td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">0.0025</td>
<td valign="top" valign="top" rowspan="1">

Difference between consecutive `word-spacing` values.

</td>
</tr>
<tr>
<td valign="top" rowspan="1"><strong title="Required">autoDetectResize</strong></td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1">true</td>
<td valign="top" valign="top" rowspan="1">

Whether to automatically refit text when the container element resizes.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onReadyForTypesetting</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Callback for the owner to know when text is done refitting.

</td>
</tr>
</tbody>
</table>

<!-- END component-docs -->
