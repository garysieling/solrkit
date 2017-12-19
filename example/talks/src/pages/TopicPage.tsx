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
  ResultsList,
  Pagination,
  PaginationData,
  Bound
} from 'solrkit';

interface SearchPageProps {
  query: string;
  page: number;
  facets: { [ key: string ]: string[] };
}

const dataStore = new AppDataStore('topic');

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

class TopicPage extends React.Component<SearchPageProps, {}> {
  static dataStore = dataStore;

  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;
  private footer: () => JSX.Element;
  private rightRail: () => JSX.Element;

  constructor() {
    super();

    this.left = () => (
      <div>
        <Bound
          dataStore={dataStore.talks}
          event={dataStore.talks.registerFacet(['collection_l1_ss'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Collection" 
                values={data}
                search={true}
                facet="collection_l1_ss"
                render={(label: string, value: number) => 
                  label + ': ' + value.toLocaleString()}
              />
            )
          }
        />

        <Bound
          dataStore={dataStore.talks}
          event={dataStore.talks.registerFacet(['speakerName_ss'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Speaker" 
                values={data}
                search={true}
                initialValues={[
                  'Christena Cleveland',
                  'James Cone',
                  'Paulo Freire',
                  'James Baldwin'
                ]}
                facet="speakerName_ss"
                render={(label: string, value: number) => label}
              />
            )
          }
        />

        <Bound
          dataStore={dataStore.talks}
          event={dataStore.talks.registerFacet(['entities_ss'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Tag" 
                values={data}
                search={true}
                facet="entities_ss"
                render={(label: string, value: number) => label}
              />
            )
          }
        />

        <Bound
          dataStore={dataStore.talks}
          event={dataStore.talks.registerFacet(['category_l1_ss'])}
          render={
            (data: [string, number, boolean][]) => (
              <CheckFacet 
                title="Topic" 
                values={data}
                search={true}
                facet="category_l1_ss"
                render={(label: string, value: number) => 
                  label + ': ' + value.toLocaleString()}
              />
            )
          }
        />
      </div>
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
                    <h5>
                      {talk.title_s}
                    </h5>
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

  componentDidMount() {
    // this isn't taking url props
    dataStore.talks.stateTransition(
      {
        type: 'QUERY', 
        query: this.props.query,
        page: this.props.page,
        facets: this.props.facets
      }
    );
  }

  componentWillReceiveProps(newProps: SearchPageProps) {
    dataStore.talks.stateTransition(
      {
        type: 'QUERY', 
        query: newProps.query,
        page: newProps.page,
        facets: newProps.facets
      }
    );
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

export { TopicPage };