import {useEffect, useMemo, useState} from 'react';
import {wrap, Remote} from 'comlink';

interface ModuleType {
  initialize(): Promise<void>;
}

export function useWorker<T extends ModuleType>(createWorker: () => Worker): [boolean, (calculating: boolean) => void, Remote<T>, () => void] {
  const [worker, setWorker] = useState(createWorker);
  const proxy = useMemo(() => wrap<T>(worker), [worker]);
  const [initialized, setInitialize] = useState(false);
  const [calculating, setCalculating] = useState(true);

  useEffect(() => {
    if (initialized) return;
    proxy.initialize().then(() => {
      setInitialize(true);
      setCalculating(false);
    });
  }, [initialized, calculating, proxy]);

  function cancel(): void {
    worker.terminate();
    setCalculating(true);
    setWorker(createWorker());
    setInitialize(false);
  }

  return [calculating, setCalculating, proxy, cancel];
}
