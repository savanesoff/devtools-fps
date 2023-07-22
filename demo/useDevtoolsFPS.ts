import { useEffect, useState } from "react";
import devtoolsFPS from "../src/index";

export function useDevtoolsFPS(): {
  devtoolsFPS: typeof devtoolsFPS;
  _: ReturnType<typeof setTimeout> | undefined;
} {
  const [id, setId] = useState<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const id = setTimeout(() => {
      setId(id);
    }, 200);
  }, [id]);

  return {
    devtoolsFPS,
    _: id,
  };
}
