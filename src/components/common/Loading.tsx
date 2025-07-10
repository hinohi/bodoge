import type React from 'react';

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="section">
      <div className="container has-text-centered">
        <div className="is-size-4">{text}</div>
        <progress className="progress is-primary" max="100" />
      </div>
    </div>
  );
};
