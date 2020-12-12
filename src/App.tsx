import React, { useState } from "react";
import worker from "./twice.worker";

const twice = worker();

const App = () => {
  const [value, setValue] = useState(1);
  return (
    <div>
      <button
        onClick={() => {
          twice.twice(value).then((result: any) => {
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
