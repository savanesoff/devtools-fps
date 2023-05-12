import { useEffect, useState } from "react";
import devtoolsFPS from "../src/index";

export function useDevtoolsFPS(): {
  devtoolsFPS: typeof devtoolsFPS;
  _: boolean;
} {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setTrigger(!trigger);
    }, 200);
  }, [trigger]);
  return {
    devtoolsFPS,
    _: trigger,
  };
}
