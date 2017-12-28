import * as React from 'react';
import * as _ from 'lodash';
import { suggestions } from './data/suggestions';
import { AppDataStore } from './data/AppDataStore';
import { Talk } from './data/Document';

import {
  ResultsLayout,  
  SearchBox,
  PaginationData,
  Bound,
  GenericSolrQuery
} from 'solrkit';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';

const searches: SavedSearch[] = [
  {
    title: 'Economic Justice',
    search: {
      query: 'Economic'
    }
  },
  {
    title: 'Rights',
    search: {
      query: 'Rights'
    }
  },
  {
    title: 'Civil Rights Movemenet',
    search: {
      query: 'Civil'
    }
  },
  {
    title: '...And Churches',
    search: {
      query: 'James'
    }
  }
];

interface SearchPageProps {
  query: string;
  page: number;
  facets: { [ key: string ]: string[] };
}

const dataStore = new AppDataStore('topic');

interface SavedSearch {
  title: string;
  search: GenericSolrQuery;
};

const PlayIcon = ({selected}: {selected: boolean}) => (
  <g 
    transform="translate(-30,-30)"
    fill="none" 
    fill-rule="evenodd" 
    id="gloss" 
    stroke="none" 
    stroke-width="1"
  >
    <g id="play_store">
      <path 
        d="M30,60 C46.5685433,60 60,46.5685433 60,30 C60,13.4314567 46.5685433,0 30,0 C13.4314567,0 0,13.4314567 0,30 C0,46.5685433 13.4314567,60 30,60 Z" 
        fill={selected ? '#FF2626' : '#262626'}
        id="Play-Store"
      />
      <path 
        d="M51.2132037,8.78679626 C56.6421358,14.2157283 60,21.7157283 60,30 C60,46.5685433 46.5685433,60 30,60 C21.7157283,60 14.2157283,56.6421358 8.78679626,51.2132037 L51.2132037,8.78679626 Z" 
        fill={selected ? '#FF0000' : '#000000'}
        fill-opacity="0.400000006"
      />
      <g 
        id="Play-Store" 
        transform="translate(17.461538, 13.000000)"
      >
        <path 
          d="M18.3076923,10.6203459 L2.52728106,2 C1.70485715,2 1.03846154,2.66475248 1.03846154,3.48514851 L1.03846154,30.5148515 C1.03846154,31.3352475 1.70485715,32 2.52728106,32 C2.52728106,32 11.1806001,27.244086 18.3076923,23.3439795 L18.3076923,10.6203459 Z" 
          fill="#FFFFFF"
          id="Mask"
        />
        <path 
          d="M21.5106871,12.370042 L27.5394489,15.6633663 C30.2199196,17.1072277 27.5394489,18.3366337 27.5394489,18.3366337 C27.5394489,18.2531683 2.52728106,32 2.52728106,32 C2.4790684,32 2.43139195,31.9977155 2.38435454,31.9932491 L21.5106871,12.370042 Z" 
          fill="#CCCCCC" 
          id="Mask"
        />
        <path 
          d="M2.52823098,2.00051891 L27.5394489,15.6633663 C30.2199196,17.1072277 27.5394489,18.3366337 27.5394489,18.3366337 C27.5394489,18.3101555 25.0222692,19.6755337 21.5849861,21.552341 L2.52823098,2.00051891 Z"
          fill="#CCCCCC" 
          id="Mask"
        />
        <path 
          d="M21.5430894,12.3877424 L27.5394489,15.6633663 C30.2199196,17.1072277 27.5394489,18.3366337 27.5394489,18.3366337 C27.5394489,18.3101555 25.0222692,19.6755337 21.5849861,21.552341 L17.0977657,16.9485492 L21.5430894,12.3877424 Z"
          fill="#FFFFFF" 
          id="Mask"
        />
      </g>
    </g>
  </g>
);

const CheckmarkIcon = () => (
  <g>
    <g>
      <circle 
        cx="64" 
        cy="64" 
        r="64"
      />
    </g>
    <g>
      <path 
        fill="#FFF"
        d="M54.3,97.2L24.8,67.7c-0.4-0.4-0.4-1,0-1.4l8.5-8.5c0.4-0.4,1-0.4,1.4,0L55,78.1l38.2-38.2   c0.4-0.4,1-0.4,1.4,0l8.5,8.5c0.4,0.4,0.4,1,0,1.4L55.7,97.2C55.3,97.6,54.7,97.6,54.3,97.2z"
      />
    </g>
  </g>
);

const Watched = ({id}: {id: string}) => (
  (_.get(localStorage, 'watched' + id, '') + '' === 'true') ? (
    <g>
      <rect
        fill="#0006" 
        width="320" 
        height="180" 
      />
      <g
        transform="translate(275,135) scale(0.3)"
      >
        <CheckmarkIcon />
      </g>
    </g>
  ) : null
);

function thumbnailUrl(url: string) {
  return (
    'http://img.youtube.com/vi/' + 
    url.replace(/.*v=/, '') +
    '/mqdefault.jpg'
  );
}

class VideoThumbnail extends React.Component<{talk: Talk}, {hover: boolean}> {
  constructor() {
    super();

    this.state = {
      hover: false
    };

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseEnter() {
    this.setState({hover: true});
  }

  onMouseLeave() {
    this.setState({hover: false});
  }

  render() {
    const talk = this.props.talk;
    return (
      <svg
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        viewBox="0 0 320 180"
        style={{
          width: '100%',
          borderRadius: '5px'
        }}
      >
        <image
          xlinkHref={thumbnailUrl(talk.url_s)} 
          width="320"
          height="180"
        />        
        <Watched id={talk.id} />
        <g
          transform="translate(160,90) scale(0.75)"
        >
          <PlayIcon selected={this.state.hover} />
        </g>
      </svg>
    );
  }
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
  talks: Talk[],
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
              (talk: Talk) => (
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
                        <VideoThumbnail talk={talk} />
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
                dataStore={dataStore.talks.refine(
                  savedSearch.search
                )}
                render={
                  (talks: Talk[], pagination: PaginationData) => 
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