import * as React from 'react';
import { SingleComponent } from '../context/DataStore';

interface ResultsListProps<T> {
  docs: T[];
  render: SingleComponent<T>;
}

class ResultsList<T> extends React.Component<ResultsListProps<T>> {
  render() {
    const { docs, render } = this.props;

    return (
      <div>
        {
          (docs || []).map(
            (doc, i) => <div key={i}>{render(doc)}</div>
          )
        }
      </div>
    );
  }
}

export {
  ResultsList, 
  ResultsListProps
};