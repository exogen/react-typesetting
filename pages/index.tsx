import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useState
} from "react";
import { Swipeable } from "react-swipeable";
import TightenText from "../src/TightenText";

interface ResizableProps {
  children: ReactNode | ((width: number) => ReactNode);
  initialWidth: number;
  style?: {};
}

const Resizable: FunctionComponent<ResizableProps> = ({
  children,
  initialWidth,
  style
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [delta, setDelta] = useState(0);

  const handleSwiping = useCallback(data => {
    setDelta(-data.deltaX);
  }, []);

  const handleSwiped = useCallback(data => {
    setWidth(width => Math.max(0, width - data.deltaX));
    setDelta(0);
  }, []);

  const activeWidth = Math.max(0, width + delta);

  return (
    <div
      style={{
        position: "relative",
        width: activeWidth,
        background: "rgb(226, 221, 216)",
        ...style
      }}
    >
      {typeof children === "function" ? children(activeWidth) : children}
      <Swipeable
        delta={1}
        preventDefaultTouchmoveEvent
        trackMouse
        onSwiping={handleSwiping}
        onSwiped={handleSwiped}
        style={{
          position: "absolute",
          top: -1,
          right: -9,
          bottom: -1,
          width: 9,
          borderRadius: 2,
          background: "rgb(32, 145, 249)",
          cursor: "ew-resize"
        }}
      ></Swipeable>
    </div>
  );
};

export default function DemoPage() {
  const [enabled, setEnabled] = useState(true);

  return (
    <main>
      <div>
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={event => {
              setEnabled(event.target.checked);
            }}
          />{" "}
          Enabled
        </label>
      </div>
      <h1>
        <Resizable initialWidth={420}>
          {width => (
            <TightenText disabled={!enabled} reflowKey={width}>
              Islay single malt Scotch whisky
            </TightenText>
          )}
        </Resizable>
      </h1>
    </main>
  );
}
