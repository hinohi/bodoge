import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

const wasm = Comlink.wrap<import('./worker').ModuleType>(new Worker('./worker', {
  name: 'twice',
  type: 'module',
}));

function Twice() {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState(1);

  useEffect(() => {
    wasm.initialize().then(() => setLoaded(true));
  }, [loaded]);

  return (
    <div className="container">
      <div className="content">
        <p>{value}</p>
        <button
          onClick={() => {
            if (loaded) {
              wasm.twice(value).then(setValue);
            }
          }}
        >
          x2
        </button>
      </div>
    </div>
  );
}

export default Twice;
