import * as React from 'react';
import { SingleComponent } from '../context/DataStore';

interface ResultsListProps<T> {
  docs: T[];
  render: SingleComponent<T>;

  height?: number;
}

class ResultsList<T> extends React.Component<ResultsListProps<T>> {
  render() {
    const { docs, render, height } = this.props;

    let style = {};
    if (this.props.height) {
      style = {
        height: height + 'px',
        float: 'left',
        padding: '5px'
      };
    }

    return (
      <div>
        {
          (docs || []).map(
            (doc, i) => 
              <div
                key={i}
                style={style}
              >
                {render(doc, i)}
              </div>
          )
        }
      </div>
    );
  }
}

export {
  ResultsListProps,  
  ResultsList
};