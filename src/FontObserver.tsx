import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState
} from "react";
import FontFaceObserver from "fontfaceobserver";

const DEV = process.env.NODE_ENV !== "production";

const Context = React.createContext(null);

const debug = DEV
  ? require("debug")("react-typesetting:FontObserver")
  : undefined;

type FontDescriptor =
  | string
  | {
      family: string;
      weight: number | string;
      style: string;
      stretch: string;
      testString: string;
      timeout: number;
    };

interface FontObserverProps {
  children: ReactNode;
  fonts: FontDescriptor[];
  testString: string;
  timeout: number;
}

/**
 * ```js
 * import { FontObserver } from 'react-typesetting';
 * ```
 *
 * A context provider for specifying which fonts to observe.
 */
const FontObserver: FunctionComponent<FontObserverProps> = ({ children }) => {
  const [state, setState] = useState(null);

  // TODO
  useEffect(() => {
    console.log(FontFaceObserver);
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};

export default React.memo(FontObserver);
