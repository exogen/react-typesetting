import React, { FunctionComponent, ReactNode } from "react";

interface PreventWidowsProps {
  children: ReactNode;
}

const PreventWidows: FunctionComponent<PreventWidowsProps> = ({ children }) => {
  // TODO
  return null;
};

export default React.memo(PreventWidows);
