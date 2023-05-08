import { useEffect, useState } from "react";
import {
  setBufferSize,
  setSize,
  start,
  state,
  toggleRender,
  toggleRun,
} from "../src/index";

export function useDevtoolsFPS(): {
  start: typeof start;
  state: typeof state;
  toggleRun: typeof toggleRun;
  toggleRender: typeof toggleRender;
  setSize: typeof setSize;
  setBufferSize: typeof setBufferSize;
  _: boolean;
} {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setTrigger(!trigger);
    }, 200);
  }, [trigger]);
  return {
    setBufferSize,
    setSize,
    state,
    start,
    toggleRender,
    toggleRun,
    _: trigger,
  };
}
