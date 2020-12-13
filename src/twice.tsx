import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

const wasm = Comlink.wrap<import('./twice.worker').ModuleType>(new Worker('./twice.worker', {name: 'twice', type: 'module'}));

function Twice() {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState(1);

  useEffect(() => {
    wasm.initialize().then(() => setLoaded(true));
  }, [loaded]);

  return (
    <div>
      <button
        onClick={() => {
          if (loaded) {
            wasm.twice(value).then(setValue);
          }
        }}
      >
        click me
      </button>
      <p>{value}</p>
    </div>
  );
}

export default Twice;
