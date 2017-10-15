import * as React from 'react';
import { SingleComponent } from '../context/DataStore';

interface MoreLikeThisProps<T> {
  docs: T[];
  title?: string;
  render: SingleComponent<T>;
}

class MoreLikeThis<T> extends React.Component<MoreLikeThisProps<T>> {
  render() {
    const { docs, render } = this.props;
    
    const titleDiv = this.props.title ? (
      <h3>{this.props.title}</h3>
    ) : null;

    return (
      <div>
        {titleDiv}
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