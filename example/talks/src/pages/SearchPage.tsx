import * as React from 'react';
import { suggestions } from './data/suggestions';
import { AppDataStore } from './data/AppDataStore';
import { Link } from 'react-router-dom';
import { Document } from './data/Document';

import {
  SingleNumber,
  databind,
  ResultsLayout,  
  SearchBox,
  CheckFacet,
  RadioFacet,
  DropdownFacet,
  TagFacet,
  ToggleFacet,
  ResultsList,
  Pagination,
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

/*function/ namespace(params: SearchParams, core: SolrCore<{}>, ns: string): [SolrCore<{}>, SearchParams] {
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
}*/

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
          ref={(img) => this.img = img}
          onClick={this.open} 
          src={thumbnailUrl(this.props.url_s)} 
        />
      );
  }
}

class SearchPageApp extends React.Component<{query: string}, {}> {
  static dataStore = dataStore;

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.left = 
      databind(
        dataStore.talks.registerFacet(['features_ss']),
        dataStore.talks,
        (data: [string, number, boolean][]) => (
          <div>
            <CheckFacet 
              title="Features" 
              values={data}
              facet="features_ss"
              render={(label: string, value: number) => label + ': ' + value.toLocaleString()}
            />

            <DropdownFacet 
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <RadioFacet 
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <ToggleFacet
              title="Features" 
              facet="features_ss"
              values={data}
            />

            <TagFacet 
              title="Features" 
              facet="features_ss"
              values={data}
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
          <ResultsList 
            columnWidth="four"
            docs={talks} 
            render={
              (talk: Document) => 
                <div>
                  <VideoThumbnail url_s={talk.url_s} />
                  <Link to={'/view/' + talk.id}>
                    <h2>
                      {talk.title_s}
                    </h2>
                  </Link>
                </div>
            }
          />
        );
      }
    );

    this.header = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => (
        <div className="ui grid">
          <div className="three wide column">
            <SingleNumber horizontal={true} value={pagination.numFound} label="Talks" />
          </div>
          <div className="thirteen wide column">
            <SearchBox 
              placeholder="Search..."
              loading={false}
              sampleSearches={suggestions}
            />
          </div>
        </div>
      )
    );
    
    this.footer = databindTalksQuery(
      (talks: Document[], pagination: PaginationData) => (
        <Pagination
          numRows={pagination.numFound}
          pageSize={pagination.pageSize}
        />)
    );
  }

  setState() {
    //
  }

  componentDidMount() {
    // TODO I think this is the point where namespacing would start
    dataStore.talks.doQuery(this.props.query || '*');
    /* _.map(
      this.props.dataStore.cores,
      (core, i) => namespace(fixParams(this.props.params), core, 'talks')
    ).map(
      (thisCore: [SolrCore<object>, SearchParams]) => 
        thisCore[0].stateTransition(thisCore[1])
    );*/
  }
  
  componentWillUnmount() {
    // dataStore.clearEvents();
  }

  render() { 
    return (
      <ResultsLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
        footerComponent={this.footer}
        rightRailComponent={this.rightRail}
      />
    );
  }
}

export { SearchPageApp };