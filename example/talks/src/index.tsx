import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Route, BrowserRouter } from 'react-router-dom';
import { SearchPageApp } from './pages/SearchPage';
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

interface PlacesApi {
  maps: {
    LatLng: any;
    Map: any;

    event: {
      addListener: any;
    }

    places: {
      PlacesService: any;

      PlacesServiceStatus: {
        OK: string;
      }
    }
  };
}

class MapApp extends React.Component<{}, {display: string[]}> {
  private map: any;
  private center: any;

  constructor() {
    super();

    this.search = this.search.bind(this);
    this.callback = this.callback.bind(this);

    this.state = {
      display: []
    };
  }

  callback(results: string[], status: string) {
    const self = this;
    const google: PlacesApi = _.get(window, 'google');
    
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const display = _.sortedUniq(
        results.map(
          (result) => 
            _.get(result, 'name', '')
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/ig, ' ')
            .replace(/\b(Inc|St|Av)\b/ig, ' ')
            .replace(/\b(Charter School|Public School|Junior High School|Station|High School of .*)\b/ig, ' ')
            .replace(/\b(Preparatory School|Library|City Hall|Academy Preschool|Transportation Center)\b/ig, ' ')
            .replace(/\b(School|Institute|Post Office|College|Hospital|University|High School)\b/ig, ' ')
            .replace(/\b(United States Postal Service|Mail Parcel Service|Mail Center|Historical Society)\b/ig, '')
            .replace(/\b(at|and|the|of|Foundation|Services|Academy)\b/ig, '  ')
            .replace(/[ ]+/ig, ' ')            
            .split(' ')
            .filter(
              (token) => 
                !token.match(/^[0-9]/) && // numbered streets
                token.length > 1 && // N/S/W/E
                token.toUpperCase() !== token // removes train station tokens
             ).join(
              ' '
            )
        ).concat(this.state.display)
      ).filter(
        (name) => name.indexOf(' ') > 0
      );

      self.setState( {
        display
      });
    }
  }

  componentDidMount() {
    var google: PlacesApi = _.get(window, 'google');
    
    const self = this;
    this.map = _.get(window, 'map');
    
    google.maps.event.addListener(self.map, 'idle', function() {
      self.center = self.map.getCenter(); 
    });
  }

  search() {    
    const self = this;
    var google: PlacesApi = _.get(window, 'google');
    var map = _.get(window, 'map');    
   
    [
      'school', 
      // 'courthouse', these don't have special names
      'airport', 
      'library',
      'subway_station',
      'local_government_office',
      'train_station',
      'transit_station',
      'city_hall', 
      'neighborhood'
      // 'post_office'
    ].map(
      (type) => {
        const request = {
          location: map['getCenter'](),
          radius: '5000',
          type: type
        };
      
        const service = new google.maps.places.PlacesService(self.map);
        service.nearbySearch(request, this.callback);
      }
    )

  }

  render() {
    return (
      <div>
        <h1>Scroll to a region</h1>
        <button onClick={this.search}>Search</button>
        {
          this.state.display.join(' ')
        }
      </div>
    );
  }
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
        <MapApp />
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
        <div>
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