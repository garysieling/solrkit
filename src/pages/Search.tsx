import * as React from 'react';
import { ResultsLayout } from '../layout/ResultsLayout';

class Search<T extends object> extends React.Component<{}, {data: T[]}> {
  constructor() {
    super();

    this.state = {
      data: []
    };
  }
  render() {
    return (
      <div className="ui container">
        <ResultsLayout 
          pageSize={10} 
          data={this.state.data}
        />
      </div>
    );
  }
}

export { Search };