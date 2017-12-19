import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Route, BrowserRouter } from 'react-router-dom';
import { SearchPageApp } from './pages/SearchPage';
import { MapPage } from './pages/MapPage';
import { DetailPageApp } from './pages/DetailPage';
import { TopicPage } from './pages/TopicPage';

interface PageParams {
  page: number;
  query: string;
  facets: { [ key: string ]: string[] };
}

type AppType = React.SFC<{}>;

interface SearchAppProps {
  app: AppType;
  params: PageParams;
  mode?: string;
}

class SearchApp extends React.Component<SearchAppProps, {}> {
  constructor() {
    super();
  }

  render() {
    if (this.props.mode === 'map') {
      return (
        <MapPage />
      );
    } else {
      const App = this.props.app;
      return <App />;
    }
  }
}

// From https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
function getJsonFromUrl(hashBased: string) {
  var query;
  if (hashBased) {
    var pos = location.href.indexOf('?');
    if (pos === -1) {
      return [];
    }

    query = location.href.substr(pos + 1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split('&').forEach(function(part: string) {
    if (!part) {
      return;
    }

    part = part.split('+').join(' '); // replace every + with space, regexp-free version
    var eq = part.indexOf('=');
    var key = eq > -1 ? part.substr(0, eq) : part;
    var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
    var from = key.indexOf('[');
    if (from === -1) {
      result[decodeURIComponent(key)] = val.split(',');
    } else {
      var to = key.indexOf(']', from);
      var index = decodeURIComponent(key.substring(from + 1, to));
      key = decodeURIComponent(key.substring(0, from));
      if (!result[key]) {
        result[key] = [];
      }

      if (!index) { 
        result[key].push(val);
      } else {
        result[key][index] = val.split(',');
      }
    }
  });
  return result;
}

function getFacets(
  match: {
    params: { 
      query: string, 
      page?: string 
    } 
  },
  location: {
    search: string
  }
): PageParams {
  const facets: { [ key: string ]: string[] } = getJsonFromUrl(location.search);

  return {
    query: match.params.query || '*',
    page: match.params.page ? parseInt(match.params.page, 10) : 1,
    facets: facets
  };
}

function main() {
  ReactDOM.render((
      <BrowserRouter>
        <div style={{height: '100%'}}>
          <Route 
            key="main"
            exact={true} 
            path="/talks" 
            render={({match, location}) => <SearchPageApp query={match.params.query}/>}
          />
          <Route 
            exact={true} 
            key="query"
            path="/talks/:query/:page" 
            render={({match, location}) => <SearchPageApp query={match.params.query}/>}
          />    
          <Route 
            exact={true} 
            key="map"
            path="/map" 
            render={({match, location}) => <SearchPageApp query={match.params.query}/>}
            mode="map"
          />
          <Route 
            exact={true} 
            key="topic1"
            path="/topic/:query" 
            render={
              ({match, location}) => 
              <TopicPage {...getFacets(match, location)} />}
          />
          <Route 
            exact={true} 
            key="topic2"
            path="/topic/:query/:page" 
            render={
              ({match, location}) => 
                <TopicPage {...getFacets(match, location)} />}
          />
          <Route 
            exact={true} 
            key="speaker1"
            path="/speaker/:query" 
            render={({match, location}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query} />} />}
          />
          <Route 
            exact={true} 
            key="speaker2"
            path="/speaker/:query/:page" 
            render={({match, location}) => <SearchPageApp query={match.params.query}/>}
          />
          <Route 
            path="/view/:id" 
            key="view"
            component={({match, location}) => <DetailPageApp id={match.params.id} />}
          />
        </div>
      </BrowserRouter>
    ),
    document.getElementById('root') as HTMLElement
  );
}

main();