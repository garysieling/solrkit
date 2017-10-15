import * as React from 'react';
import { SingleComponent } from '../context/DataStore';

interface MoreLikeThisProps<T> {
  docs: T[];
  render: SingleComponent<T>;
}

class MoreLikeThis<T> extends React.Component<MoreLikeThisProps<T>> {
  render() {
    const { docs, render } = this.props;
    
    return (
      <div>
        {
          docs.map(
            (doc, i) => <div key={i}>{render(doc)}</div>
          )
        }
      </div>
    );
  }
}

export {
  MoreLikeThis, 
  MoreLikeThisProps
};