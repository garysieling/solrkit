import * as React from 'react';
import * as _ from 'lodash';
import { suggestions } from './data/suggestions';
import { AppDataStore } from './data/AppDataStore';
import { Document } from './data/Document';

import {
  SingleNumber,
  databind,
  ResultsLayout,  
  SearchBox,
  CheckFacet,
  Pagination,
  PaginationData,
  Bound
} from 'solrkit';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

interface SearchPageProps {
  query: string;
  page: number;
  facets: { [ key: string ]: string[] };
}

const dataStore = new AppDataStore('topic');

function thumbnailUrl(url: string) {
  return (
    'http://img.youtube.com/vi/' + 
    url.replace(/.*v=/, '') +
    '/mqdefault.jpg'
  );
}

class Hover extends React.Component<{}, {}> {
  constructor() {
    super();
  }

  render() {
    return (
      <div 
        className="item"
        style={{
          // paddingLeft: '16px',
          // paddingRight: '6px',
          marginLeft: '30px',
          marginRight: '30px',
          marginTop: '5px',
          paddingTop: '15px',
          marginBottom: '12px',
          borderRadius: '10px'
        }}
      >
        {
          (_.flatten([this.props.children]) as object[]).map(
            (child) => (
              child
            )
          )
        }  
      </div>
    );
  }
}

class VideoScroller extends React.Component<{
  talks: Document[],
  title: string
}, {}> {
  constructor() {
    super();
  }

  render() {
    const settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      swipeToSlide: true,
      variableWidth: false
    };

    return (
      <div>          
        <h3>{this.props.title}</h3>
        <Slider {...settings}>
          {
            this.props.talks.map(
              (talk: Document) => (
                <div>
                  <div
                    style={{              
                      marginLeft: '30px',
                      marginRight: '30px'
                    }}
                  >
                    <Hover>
                      <a
                        href={'/view/' + talk.id}
                        target="_new"
                      >
                        <img         
                          style={{
                            borderRadius: '5px', 
                            cursor: 'pointer'
                          }}
                          src={thumbnailUrl(talk.url_s)} 
                        />
                        {talk.title_s}
                      </a>
                    </Hover>
                  </div>
                </div>
              )
            )
          }
        </Slider>
      </div>
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
          <div>
            <VideoScroller 
              key="1"
              talks={talks} 
              title="Topic #1"
            />

            <VideoScroller 
              key="2"
              talks={talks} 
              title="Topic #1"
            />
          </div>
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
        facets: this.props.facets
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