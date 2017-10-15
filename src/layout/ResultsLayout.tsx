import * as React from 'react';

import { Pagination } from '../components/Pagination';

interface ResultsConfig {
  pageSize: number;
  data: object[];
}

class ResultsLayout extends React.Component<ResultsConfig, {}> {
  constructor() {
    super();
  }
  
  render() {
    return (
      <div>
        <Pagination
          data={this.props.data}
          pageSize={this.props.pageSize}
        />
      </div>
    );
  }
}

export { ResultsLayout };
