import * as React from 'react';
import { ResultsLayout } from '../layout/ResultsLayout';
import { SolrResponse } from '../context/Data';

class Search<T> extends React.Component<{}, {data: SolrResponse<T>}> {
  constructor() {
    super();

    this.state = {
      data: {
        responseHeader: {
          status: 0,
          QTime: 0,
          params: {
            q: ''
          }
        }, 
        response: {
          numFound: 0,
          start: 0,
          docs: []
        }
      }
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