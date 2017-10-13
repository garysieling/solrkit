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
            (doc) => render(doc)
          )
        }
      </div>
    );
  }
}

export {
  MoreLikeThis
};