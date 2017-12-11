import * as React from 'react';
import { AppDataStore } from './data/AppDataStore';
import { Link } from 'react-router-dom';
import { Document } from './data/Document';
import * as _ from 'lodash';

import {
  databind,
  ResultsLayout,
  CheckFacet,
  ResultsList,
  PaginationData
} from 'solrkit';

const dataStore = new AppDataStore();

function embedUrl(url: String) {
  return (
    'https://www.youtube.com/embed/' + 
    url.replace(/.*v=/, '') +
    '?modestbranding=true&autoplay=1'
  );
}

function thumbnailUrl(url: string) {
  return (
    'http://img.youtube.com/vi/' + 
    url.replace(/.*v=/, '') +
    '/mqdefault.jpg'
  );
}

interface MapProps {
}

class VideoThumbnail extends React.Component<{url_s: string}, {on: boolean}> {
  private img: HTMLImageElement | null;

  constructor() {
    super();

    this.state = { on : false };
    this.open = this.open.bind(this);
  }

  open() {
    this.setState( { on: true });
  }

  render() {
    return this.state.on ? (
        <iframe 
          id="player" 
          height={this.img ? this.img.getBoundingClientRect().height : '100%'}
          width={this.img ? this.img.getBoundingClientRect().width : '100%'}
          src={embedUrl(this.props.url_s)} 
        />
      ) : (
        <img         
          width="95%"
          height="68px"
          ref={(img) => this.img = img}
          onClick={this.open} 
          src={thumbnailUrl(this.props.url_s)} 
        />
      );
  }
}

function measure(lat1: number, lon1: number, lat2: number, lon2: number) {  // generally used geo measurement function
  var R = 6378.137; // Radius of earth in KM
  var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
}

class MapSearchApp extends React.Component<MapProps, {display: string[]}> {
  static dataStore = dataStore;

  private map: any;

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();
    
    this.search = this.search.bind(this);
    this.callback = this.callback.bind(this);
    this.initMap = this.initMap.bind(this);

    this.state = {
      display: []
    };

    this.header = () => (
      <h1>
        Scroll the map and search
      </h1>
    );

    this.left = 
      databind(
        dataStore.talks.registerFacet(['collection_l1_ss']),
        dataStore.talks,
        (data: [string, number, boolean][]) => (
          <div style={{height: '100%'}}>
            <CheckFacet 
              title="Collection" 
              values={data}
              minValues={10}
              facet="collection_l1_ss"
              render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
            />
          </div>
        )
      );

    const databindTalksQuery = 
      (fn: ((talks: Document[], pagination: PaginationData) => JSX.Element)) => 
        databind(
          dataStore.talks.onQuery,
          dataStore.talks,
          fn);

    this.right = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => {
        return (
          <div>
            <ResultsList 
              columnWidth="two"
              docs={talks} 
              render={
                (talk: Document) => 
                  <div>
                    <VideoThumbnail url_s={talk.url_s} />
                    <Link to={'/view/' + talk.id}>
                      {talk.title_s}
                    </Link>
                  </div>
              }
            />
          </div>
        );
      }
    );
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

      

      dataStore.talks.doQuery({
        query: (
          '"' + (display.join('"~1 "')).replace(/ /g, '%20') + '"'
        )
      }); 
    }
  }

  initMap() {
    const self = this;
    const google: PlacesApi = _.get(window, 'google');
    if (!google) {
      setTimeout(this.initMap, 50);

      return;
    }
    
    const start = {lat: 39.9779964, lng: -75.1486154};
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: start
    });

    google.maps.event.addListener(self.map, 'idle', function() {
      // self.center = self.map.getCenter(); 

      self.setState({display: []});
      self.search();
    });

    /*var marker = new google.maps.Marker({
      position: start,
      map: map
    });*/
  }

  componentDidMount() {
    setTimeout(this.initMap, 0);
  }

  search() {    
    const self = this;
    const google: PlacesApi = _.get(window, 'google');
    const map = this.map;
   
    [
      'school', 
      // 'courthouse', these don't have special names
      // 'airport', 
      // 'library',
      'subway_station',
      'local_government_office',
      'train_station',
      'transit_station',
      // 'city_hall', 
      'neighborhood'
      // 'post_office'
    ].map(
      (type) => {
        const bounds = map['getBounds']();
        const top = bounds.getNorthEast();
        const bottom = bounds.getSouthWest();
        
        const r = Math.round(measure(top.lat(), top.lng(), bottom.lat(), bottom.lng())) + '';

        const request = {
          location: map['getCenter'](),
          radius: r,
          type: type
        };
      
        const service = new google.maps.places.PlacesService(self.map);
        service.nearbySearch(request, this.callback);
      }
    );
  }

  render() { 
    return (
      <ResultsLayout 
        headerComponent={this.header}
        leftComponent={this.left}
        rightComponent={this.right}
        footerComponent={this.footer}
        rightRailComponent={this.rightRail}
      />
    );
  }
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

class MapApp extends React.Component<{}, {}> {
  constructor() {
    super();
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <div id="root" style={{width: '100%', height: '50%'}}>
          <MapSearchApp />
        </div>
        <div id="map" style={{width: '100%', height: '50%'}} />
      </div>
    );
  }
}

export { MapApp as MapPage };