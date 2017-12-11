import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Route, BrowserRouter } from 'react-router-dom';
import { SearchPageApp } from './pages/SearchPage';
import { MapPage } from './pages/MapPage';
import { DetailPageApp } from './pages/DetailPage';

import * as _ from 'lodash';

import { DataStore, SolrCore, SearchParams } from 'solrkit';

interface RequiredAppProps {
  dataStore: DataStore;
}

interface PageParams {
  page: string;
  query: string;
}

interface SearchAppProps {
  app: RequiredAppProps;
  params: PageParams;
  mode?: string;
}

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
    start: (parseInt(params.page || '1', 10) - 1) * 10
  };
}

class SearchApp extends React.Component<SearchAppProps, {}> {
  constructor() {
    super();
  }

  init() {
    // TODO I think this is the point where namespacing would start
    _.map(
      this.props.app.dataStore.cores,
      (core, i) => namespace(fixParams(this.props.params), core, 'talks')
    ).map(
      (thisCore: [SolrCore<object>, SearchParams]) => 
        thisCore[0].stateTransition(thisCore[1])
      );
  }

  componentDidMount() {
    this.init();
  }
  
  componentWillUnmount() {
    this.props.app.dataStore.clearEvents();
  }

  render() {
    if (this.props.mode === 'map') {
      return (
        <MapPage />
      );
    } else {
      return <SearchPageApp />;
    }
  }
}

const defaultParams = {
  page: '1',
  query: '*'
};

function main() {
  ReactDOM.render((
      <BrowserRouter>
        <div style={{height: '100%'}}>
          <Route 
            key="main"
            exact={true} 
            path="/talks" 
            render={() => <SearchApp params={defaultParams} app={SearchPageApp} />}
          />
          <Route 
            exact={true} 
            key="query"
            path="/talks/:query/:page" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />    
          <Route 
            exact={false} 
            key="map"
            path="/map" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} mode="map" />}
          />      
          <Route 
            exact={false} 
            key="topic1"
            path="/topic/:query" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />
          <Route 
            exact={true} 
            key="topic2"
            path="/topic/:query/:page" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />
          <Route 
            exact={true} 
            key="speaker1"
            path="/speaker/:query" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />
          <Route 
            exact={true} 
            key="speaker2"
            path="/speaker/:query/:page" 
            render={({match}) => <SearchApp params={match.params} app={SearchPageApp} />}
          />
          <Route 
            path="/view/:id" 
            key="view"
            component={({match}) => <DetailPageApp id={match.params.id} />}
          />
        </div>
      </BrowserRouter>
    ),
    document.getElementById('root') as HTMLElement
  );
}

main();