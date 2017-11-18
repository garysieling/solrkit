import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SearchPageApp } from './pages/SearchPage';

import { DetailPageApp } from './pages/DetailPage';
// import { SearchParams, SolrCore, DataStore } from 'solrkit';
// import * as _ from 'lodash';

import { Route, BrowserRouter } from 'react-router-dom';
import './App.css';

interface PageParams {
  page: string;
  query: string;
}

interface SearchAppProps {
  params: PageParams;
}

/*
function namespace(params: SearchParams, core: SolrCore<{}>, ns: string): [SolrCore<{}>, SearchParams] {
  const result: [SolrCore<{}>, SearchParams] = [core, {
    // TODO NAMESPACING
    type: 'QUERY',
    query: params.query,
    start: params.start
  }];

  return result;
}

function fixParams(params: PageParams): SearchParams {
  return {
    type: 'QUERY',
    query: params.query,
    start: (parseInt(params.page || '1', 50) - 1) * 50
  };
}*/

class SearchApp extends React.Component<SearchAppProps, {}> {
  constructor() {
    super();
  }

  init() {
    /*_.map(
      this.props.app.dataStore.cores,
      (core, i) => namespace(fixParams(this.props.params), core, 'data')
    ).map(
      (thisCore: [SolrCore<object>, SearchParams]) => 
        thisCore[0].stateTransition(thisCore[1])
      );*/
  }

  componentDidMount() {
    this.init();
  }
  
  componentWillUnmount() {
    // this.props.app.dataStore.clearEvents();
  }

  render() {
    return <SearchPageApp />;
  }
}

const defaultParams = {
  page: '1',
  query: '*'
};

export function main() {
  ReactDOM.render(
    (
      <BrowserRouter>
        <div>
          <Route 
            exact={true} 
            path="/art" 
            render={() => <SearchApp params={defaultParams} />}
          />
          <Route 
            exact={true} 
            path="/art/:query/:page" 
            render={({match}) => <SearchApp params={match.params} />}
          />
          <Route 
            path="/piece/:id" 
            component={({match}) => <DetailPageApp id={match.params.id} />}
          />
        </div>
      </BrowserRouter>
    ),
    document.getElementById('root') as HTMLElement
  );
}

main();