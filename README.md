<div align="center">

# ❧ react-typesetting ☙

React components for creating beautifully typeset designs.

**[Demo!](https://exogen.github.io/react-typesetting)**

---

</div>

:warning: This project is highly experimental. Use at your own risk!

## Table of Contents

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [TightenText](#tightentext)
  * [Props](#props)
- [PreventWidows](#preventwidows)
  * [Props](#props-1)
- [Justify](#justify)
  * [Props](#props-2)
- [FontObserver](#fontobserver)
  * [Props](#props-3)
- [FontObserver.Provider](#fontobserverprovider)
  * [Props](#props-4)
<!-- AUTO-GENERATED-CONTENT:END -->

<!-- AUTO-GENERATED-CONTENT:START (COMPONENTS) -->

## TightenText

```js
import { TightenText } from 'react-typesetting';
```

Tightens `word-spacing`, `letter-spacing`, and `font-size` (in that order)
by the minimum amount necessary to ensure a minimal number of wrapped lines
and overflow.

The algorithm starts by setting the minimum of all values (defined by the
`minWordSpacing`, `minLetterSpacing`, and `minFontSize` props) to determine
whether adjusting these will result in fewer wrapped lines or less overflow.
If so, then a binary search is performed (with at most `maxIterations`) to
find the best fit.

By default, element resizes that may necessitate refitting the text are
automatically detected. By specifying the `reflowKey` prop, you can instead
take manual control by changing the prop whenever you’d like the component to
update.

Note that unlike with typical justified text, the fit adjustments must apply
to all lines of the text, not just the lines that need to be tightened,
because there is no way to target individual wrapped lines. Thus, this
component is best used sparingly for typographically important short runs
of text, like titles or labels.

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
<td valign="top" rowspan="1">className</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The class to apply to the outer wrapper `span` created by this component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">style</td>
<td valign="top" colspan="2">Object</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Extra style properties to add to the outer wrapper `span` created by this
component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">Node</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The content to render.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">minWordSpacing</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">-0.02</td>
<td valign="top" valign="top" rowspan="1">

Minimum word spacing in ems. Set this to 0 if word spacing should not be
adjusted.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">minLetterSpacing</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">-0.02</td>
<td valign="top" valign="top" rowspan="1">

Minimum letter spacing in ems. Set this to 0 if word spacing should not
be adjusted.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">minFontSize</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">0.97</td>
<td valign="top" valign="top" rowspan="1">

Minimum `font-size` in ems. Set this to 1 if font size should not be
adjusted.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">maxIterations</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">5</td>
<td valign="top" valign="top" rowspan="1">

When performing a binary search to find the optimal value of each CSS
property, this sets the maximum number of iterations to run before
settling on a value.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowKey</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String
</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

If specified, disables automatic reflow so that you can trigger it
manually by changing this value. The prop itself does nothing, but
changing it will cause React to update the component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowTimeout</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Debounces reflows so they happen at most this often in milliseconds (at
the end of the given duration). If not specified, reflow is computed
every time the component is rendered.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">disabled</td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Whether to completely disable refitting the text. Any fit adjustments
that have already been applied in a previous render will be preserved.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onReflow</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A function to call when layout has been recomputed and the text is done
refitting.

</td>
</tr>
</tbody>
</table>

## PreventWidows

```js
import { PreventWidows } from 'react-typesetting';
```
Prevents [widows](https://www.fonts.com/content/learning/fontology/level-2/text-typography/rags-widows-orphans)
by measuring the width of the last line of text rendered by the component’s
children. Spaces will be converted to non-breaking spaces until the given
minimum width or the maximum number of substitutions is reached.

By default, element resizes that may necessitate recomputing line widths are
automatically detected. By specifying the `reflowKey` prop, you can instead
take manual control by changing the prop whenever you’d like the component to
update.

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
<td valign="top" rowspan="1">className</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The class to apply to the outer wrapper `span` created by this component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">style</td>
<td valign="top" colspan="2">Object</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Extra style properties to add to the outer wrapper `span` created by this
component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">Node</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The content to render.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">maxSubstitutions</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1">3</td>
<td valign="top" valign="top" rowspan="1">

The maximum number of spaces to substitute.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">minLineWidth</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;Function
</td>
<td valign="top" align="right" rowspan="1">15%</td>
<td valign="top" valign="top" rowspan="1">

The minimum width of the last line, below which non-breaking spaces will
be inserted until the minimum is met.

* **Numbers** indicate an absolute pixel width.
* **Strings** indicate a CSS `width` value that will be computed by
  temporarily injecting an element into the container and determining its
  width.
* **Functions** will be called with relevant data to determine a dynamic
  number or string value to return. This can be used, for example, to
  have different rules at different breakpoints – like a media query.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">nbspChar</td>
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
being inserted for debugging purposes, or adjust their width.

* **String** values will be inserted directly into the existing Text node
  containing the space.
* **React Element** values will be rendered into an in-memory “incubator”
  node, then transplanted into the DOM, splitting up the Text node in
  which the space was found.
* **Function** values must produce a string, Text node, Element node, or
  React Element to insert.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowKey</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String
</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

If specified, disables automatic reflow so that you can trigger it
manually by changing this value. The prop itself does nothing, but
changing it will cause React to update the component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowTimeout</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Debounces reflows so they happen at most this often in milliseconds (at
the end of the given duration). If not specified, reflow is computed
every time the component is rendered.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">disabled</td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Whether to completely disable widow prevention.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onReflow</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A function to call when layout has been recomputed and space substitution
is done.

</td>
</tr>
</tbody>
</table>

## Justify

```js
import { Justify } from 'react-typesetting';
```

While this may include more advanced justification features in the future, it
is currently very simple: it conditionally applies `text-align: justify` to
its container element (a `<p>` by default) depending on whether or not there
is enough room to avoid large, unseemly word gaps. The minimum width is
defined by `minWidth` and defaults to 16 ems.

You might also accomplish this with media queries, but this component can
determine the exact width available to the container element instead of just
the entire page.

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
<td valign="top" rowspan="1">className</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The class to apply to the outer wrapper element created by this
component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">style</td>
<td valign="top" colspan="2">Object</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Extra style properties to add to the outer wrapper element created by
this component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">Node</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The content to render.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">as</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;String <br>
&nbsp;&nbsp;Function <br>
&nbsp;&nbsp;Object
</td>
<td valign="top" align="right" rowspan="1">p</td>
<td valign="top" valign="top" rowspan="1">

The element type in which to render the supplied children. It must be
a block level element, like `p` or `div`, since `text-align` has no
effect on inline elements. It may also be a custom React component, as
long as it uses `forwardRef`.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">minWidth</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String
</td>
<td valign="top" align="right" rowspan="1">16em</td>
<td valign="top" valign="top" rowspan="1">

The minimum width at which to allow justified text. Numbers indicate an
absolute pixel width. Strings will be applied to an element's CSS in
order to perform the width calculation.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">initialJustify</td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1">true</td>
<td valign="top" valign="top" rowspan="1">

Whether or not to initially set `text-align: justify` before the
available width has been determined.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowKey</td>
<td valign="top" colspan="2">
One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String
</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

If specified, disables automatic reflow so that you can trigger it
manually by changing this value. The prop itself does nothing, but
changing it will cause React to update the component.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">reflowTimeout</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Debounces reflows so they happen at most this often in milliseconds (at
the end of the given duration). If not specified, reflow is computed
every time the component is rendered.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">disabled</td>
<td valign="top" colspan="2">Boolean</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

Whether to completely disable justification detection. The last
alignment that was applied will be preserved.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">onReflow</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A function to call when layout has been recomputed and justification
has been applied or unapplied.

</td>
</tr>
</tbody>
</table>

## FontObserver

```js
import { FontObserver } from 'react-typesetting';
```

A component for observing the fonts specified in the `FontObserver.Provider`
component.

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
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">Function</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A function that will receive the current status of the observed fonts.
The argument will be an object with these properties:

- `fonts`: An array of the fonts passed to `FontObserver.Provider`, each
  with a `loaded` and `error` property.
- `loaded`: Whether all observed fonts are done loading.
- `error`: If any fonts failed to load, this will be populated with the
  first error.

</td>
</tr>
</tbody>
</table>

## FontObserver.Provider

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
<td valign="top" rowspan="8"><strong title="Required">fonts</strong></td>
<td valign="top" colspan="2">
Array of… <br>
&nbsp;&nbsp;One of… <br>
&nbsp;&nbsp;&nbsp;&nbsp;String <br>
&nbsp;&nbsp;&nbsp;&nbsp;<a href="#shape-1" title="{ family, weight, style, stretch, testString, timeout }">Object&thinsp;<sup>1</sup></a>
</td>
<td valign="top" align="right" rowspan="8"></td>
<td valign="top" valign="top" rowspan="8">

The fonts to load and observe. The font files themselves should already
be specified somewhere (in CSS), this component simply uses `FontFaceObserver`
to force them to load (if necessary) and observe when they are ready.

Each item in the array specifies the font `family`, `weight`, `style`,
and `stretch`, with only `family` being required. Additionally, each item
can contain a custom `testString` and `timeout` for that font, if they
should diff from the defaults. If only the family name is needed, the
array item can just be a string.

</td>
</tr>
<tr><td colspan="2"><a name="shape-1"><sup>1</sup>&thinsp;Object</a></td></tr>
<tr><td valign="top"><strong title="Required">family</strong></td><td valign="top">String</td></tr>
<tr><td valign="top">weight</td><td valign="top">One of… <br>
&nbsp;&nbsp;Number <br>
&nbsp;&nbsp;String</td></tr>
<tr><td valign="top">style</td><td valign="top">String</td></tr>
<tr><td valign="top">stretch</td><td valign="top">String</td></tr>
<tr><td valign="top">testString</td><td valign="top">String</td></tr>
<tr><td valign="top">timeout</td><td valign="top">Number</td></tr>
<tr>
<td valign="top" rowspan="1">testString</td>
<td valign="top" colspan="2">String</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A custom test string to pass to the `load` method of `FontFaceObserver`,
to be used for all fonts that do not specify their own `testString`.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">timeout</td>
<td valign="top" colspan="2">Number</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

A custom timeout in milliseconds to pass to the `load` method of
`FontFaceObserver`, to be used for all fonts that do not specify their
own `timeout`.

</td>
</tr>
<tr>
<td valign="top" rowspan="1">children</td>
<td valign="top" colspan="2">Node</td>
<td valign="top" align="right" rowspan="1"></td>
<td valign="top" valign="top" rowspan="1">

The content that will have access to font loading status via context.

</td>
</tr>
</tbody>
</table>
<!-- AUTO-GENERATED-CONTENT:END -->
