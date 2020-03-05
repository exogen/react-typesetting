import React from 'react';
import { render } from '@testing-library/react';
import TightenText from './TightenText';

describe('TightenText', () => {
  it('renders children inside two spans', () => {
    const { container } = render(
      <TightenText>Islay single malt Scotch whisky</TightenText>
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
      <span
        style="display: inline-block; transform-origin: 0 0;"
      >
        <span>
          Islay single malt Scotch whisky
        </span>
      </span>
    `);
  });
});
