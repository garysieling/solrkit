import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Route, BrowserRouter } from 'react-router-dom';
import { SearchPageApp } from './pages/SearchPage';
import { MapPage } from './pages/MapPage';
import { DetailPageApp } from './pages/DetailPage';
import { TopicPage } from './pages/TopicPage';

interface PageParams {
  page: string;
  query: string;
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

function main() {
  ReactDOM.render((
      <BrowserRouter>
        <div style={{height: '100%'}}>
          <Route 
            key="main"
            exact={true} 
            path="/talks" 
            render={({match}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query}/>} />}
          />
          <Route 
            exact={true} 
            key="query"
            path="/talks/:query/:page" 
            render={({match}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query}/>} />}
          />    
          <Route 
            exact={true} 
            key="map"
            path="/map" 
            render={({match}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query}/>} />}
            mode="map"
          />
          <Route 
            exact={true} 
            key="topic1"
            path="/topic/:query" 
            render={
              ({match}) => 
                <SearchApp 
                  params={match.params} 
                  app={() => <TopicPage query={match.params.query}/>} 
                />}
          />
          <Route 
            exact={true} 
            key="topic2"
            path="/topic/:query/:page" 
            render={
              ({match}) => 
                <SearchApp 
                  params={match.params} 
                  app={() => <TopicPage query={match.params.query} page={match.params.page} />} 
                />}
          />
          <Route 
            exact={true} 
            key="speaker1"
            path="/speaker/:query" 
            render={({match}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query}/>} />}
          />
          <Route 
            exact={true} 
            key="speaker2"
            path="/speaker/:query/:page" 
            render={({match}) => 
              <SearchApp params={match.params} app={() => <SearchPageApp query={match.params.query}/>} />}
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