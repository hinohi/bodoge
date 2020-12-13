import React, { useState } from "react";
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import worker from "workerize-loader!./twice.worker";

const workerInstance: typeof import('twice') = worker();

const App = () => {
  const [value, setValue] = useState(1);
  return (
    <div>
      <button
        onClick={() => {
          workerInstance.twice(value).then((result: any) => {
            if (Number.isInteger(result)) {
              setValue(result);
            }
          });
        }}
      >
        click me
      </button>
      <p>{value}</p>
    </div>
  );
};

export default App;
