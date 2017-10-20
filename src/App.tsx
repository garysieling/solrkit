import * as React from 'react';
import * as _ from 'lodash';
import './App.css';

import { Histogram, HistogramProperties } from './component/facet/Histogram';
import { Pagination, PaginationProperties } from './component/Pagination';

import { sampleHistogramData } from './editor/SampleData';

import Properties from './editor/Properties';

class App extends React.Component<{}, {}> {
  constructor() {
    super();

    this.onClick = this.onClick.bind(this);
  }
  
  onClick(event: string) {
    //
  }

  render() {
    return (
      <div>
        <Properties properties={PaginationProperties} name="Pagination" >
          <Pagination 
            numRows={100}
            pageSize={10} 
          />
        </Properties>        

        <Properties properties={HistogramProperties} name="Histogram" >
          <Histogram 
            data={sampleHistogramData} 
            facetHandler={_.partial(this.onClick, 'facetHandler')} /* TODO separate out events */
          />
        </Properties>       
      </div>
    );
  }
}

export default App;
