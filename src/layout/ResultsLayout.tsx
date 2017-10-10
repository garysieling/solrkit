import * as React from 'react';

import { Pagination } from '../components/Pagination';
import { SolrResponse } from '../context/Data';

interface ResultsConfig<T> {
  pageSize: number;
  data: SolrResponse<T>;
}

class ResultsLayout<T> extends React.Component<ResultsConfig<T>, {}> {
  constructor() {
    super();
  }
  
  render() {
    return (
      <div>
        <Pagination
          data={this.props.data.response.docs}
          pageSize={this.props.pageSize}
        />
      </div>
    );
  }
}

export { ResultsLayout };
