import * as React from 'react';
import * as _ from 'lodash';
import { suggestions } from './data/suggestions';
import { AppDataStore } from './data/AppDataStore';
import { Document } from './data/Document';

import {
  ResultsLayout,  
  SearchBox,
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

interface SavedSearch {
  title: string;
  search: {
    q: string;
  };
}

const searches: SavedSearch[] = [
  {
    title: 'Economic Justice',
    search: {
      q: 'Economic Justice'
    }
  },
  {
    title: 'Jewish Theologians',
    search: {
      q: 'Abraham Heschel'
    }
  },
  {
    title: 'Civil Rights Movemenet',
    search: {
      q: 'Civil Rights Movement'
    }
  },
  {
    title: '...And Churches',
    search: {
      q: 'James Cone'
    }
  }
];

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
          // marginLeft: '10px',
          // marginRight: '10px',
          marginTop: '0px',
          paddingTop: '0px',
          marginBottom: '0px',
          borderRadius: '10px',
          width: '100%'
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

interface ArrowProps {
  className?: string;
  style?: object;
  onClick?: () => void;
}

function NextArrow(props: ArrowProps) {
  const {className, style, onClick} = props;

  return (
    <div
      className={className}
      style={{
        ...style,         
        height: '100%',        
        width: '25px',
        display: 'block', 
        background: 'red'
      }}
      onClick={onClick}
    />
  );
}

function PrevArrow(props: ArrowProps) {
  const {className, style, onClick} = props;

  return (
    <div
      className={className}
      style={{
        ...style, 
        height: '100%',        
        width: '25px',
        display: 'block', 
        background: 'green'
      }}
      onClick={onClick}
    />
  );
}

class VideoScroller extends React.Component<{
  talks: Document[],
  title: string
}, {}> {
  private slider;
  private prevArrow;
  private nextArrow;
  private dragging: boolean;

  constructor() {
    super();

    this.prevArrow = (
      <PrevArrow />
    );

    this.nextArrow = (
      <NextArrow />
    );

    this.onClickVideo = this.onClickVideo.bind(this);
    this.dragging = false;
  }

  onClickVideo(e: React.MouseEvent<HTMLAnchorElement>) {   
    if (this.dragging) {
      e.preventDefault();
      
      return true;
    } else {
      return false;
    }
  }

  render() {
    const settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 2,
      swipeToSlide: true,
      variableWidth: false,
      prevArrow: this.prevArrow,      
      nextArrow: this.nextArrow,
      beforeChange: () => this.dragging = true,
      afterChange: () => this.dragging = false,
    };

    return (
      <div 
        style={{
          paddingLeft: '25px',
          paddingRight: '25px',
          paddingBottom: '35px'
        }}
      >          
        <h3>{this.props.title}</h3>
        <Slider 
          {...settings}
          ref={(slider) => this.slider = slider}
        >
          {
            this.props.talks.map(
              (talk: Document) => (
                <div>
                  <div
                    style={{              
                      marginLeft: '5px',
                      marginRight: '5px'
                    }}
                  >
                    <Hover>
                      <a
                        href={'/view/' + talk.id}
                        target="_new"
                        onClick={this.onClickVideo}
                        style={{
                          width: '100%',
                        }}
                      >
                        <img         
                          style={{
                            width: '100%',
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

    this.right = 
      () => (
        <div>{
          searches.map(
            (savedSearch: SavedSearch, i: number) => (
              <Bound
                key={i + ''}
                dataStore={dataStore.talks}
                render={
                  (talks: Document[], pagination: PaginationData) => 
                    <VideoScroller 
                      key={i + ''}
                      talks={talks} 
                      title={savedSearch.title}
                    />
                }
              />
            )
          )
        }</div>
      );

    this.header = () => (
      <div className="ui grid">
        <div className="sixteen wide column">
          <SearchBox 
            placeholder="Search..."
            loading={false}
            sampleSearches={suggestions}
          />
        </div>
      </div>
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