import * as React from 'react';
import { AppDataStore } from './data/AppDataStore';
import { Talk, Book } from './data/Document';
import { suggestions } from './data/suggestions';
import { get } from 'lodash';

import { 
  databind,
  Bound,
  SearchBox,
  MoreLikeThis,
  DetailLayout,
  PaginationData,
  SearchParams
} from 'solrkit';

function thumbnailUrl(url: string) {
  return (
    'http://img.youtube.com/vi/' + 
    url.replace(/.*v=/, '') +
    '/mqdefault.jpg'
  );
}



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
      <circle 
        r="35"
        cx="30"
        cy="30"
        fill="#FFFFFF"
        id="around"
      />
      <path 
        d="M30,60 C46.5685433,60 60,46.5685433 60,30 C60,13.4314567 46.5685433,0 30,0 C13.4314567,0 0,13.4314567 0,30 C0,46.5685433 13.4314567,60 30,60 Z" 
        fill={selected ? '#FF2626' : '#262626'}
        fill-opacity="0.1"
        id="Play-Store"
      />
      <path 
        d="M51.2132037,8.78679626 C56.6421358,14.2157283 60,21.7157283 60,30 C60,46.5685433 46.5685433,60 30,60 C21.7157283,60 14.2157283,56.6421358 8.78679626,51.2132037 L51.2132037,8.78679626 Z" 
        fill={selected ? '#FF0000' : '#000000'}
        fill-opacity="0.1"
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
  (get(localStorage, 'watched' + id, '') + '' === 'true') ? (
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

class VideoThumbnail extends React.Component<
  {
    talk: Talk
    onClick: () => void
  }, 
  {hover: boolean}> {
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
        onClick={this.props.onClick}
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

class VideoPlayer extends React.Component<Talk, {}> {
  youtubeId(url: String) {
    return url.replace(/.*v=/, '');
  }

  render() {
    const url = this.props.url_s;

    const ytUrl: string | undefined = 
      url ? (
        'https://www.youtube.com/embed/' + this.youtubeId(url) 
        + '?modestbranding=true'
      ) : undefined;

      return (
      <div>
        <iframe 
          id="player" 
          width="100%"
          height="390"
          src={ytUrl} 
        />
        <h2>
          {this.props.title_s}
        </h2>
        {
          get(
            this,
            'props.speakerName_ss',
            []
          ).map(
            (speaker: String) => (
              <div>
                <p>
                  More talks by <a 
                    href={'https://www.findlectures.com/?p=1&speaker=' + speaker.replace(/ /g, '%20')}
                  >
                    {speaker}
                  </a>
                </p>

                <Bound
                  key={speaker}
                  dataStore={dataStore.books}
                  autoload={{query: speaker}}
                  render={
                    (books: Book[], pagination: PaginationData) => 
                      <p>
                        {
                          books.length > 0 ? (
                            <h4>Books by {speaker}</h4>
                          ) : null
                        }
                        {books.filter(
                          (book) => 
                            book.thumbnail_url_s.length > 'https://covers.openlibrary.org/b/id/-1-M.jpg'.length
                        ).map(
                          (book: Book, index: number) => {
                            const replacedAuthor = book.author_key_s.replace(/ /g, '+');
                            const replacedTitle = book.title_s.replace(/ /g, '+');
                            
                            const amazonUrl =
                              `https://www.amazon.com/s/ref=as_li_ss_tl` + 
                              `?url=search-alias=aps&field-keywords='${replacedAuthor}'%20'${replacedTitle}'` + 
                              `&linkCode=ll2&tag=findlectures-20&linkId=e74a25c0b9b62f51431008f4dfeae781`;

                            return (
                              <a 
                                key={index + ''}
                                href={amazonUrl} 
                                target="_new"
                              >
                                <img 
                                  style={{
                                    height: '200px',
                                    borderRadius: '5px',
                                    marginRight: '5px'
                                  }}
                                  src={book.thumbnail_url_s} 
                                />
                              </a>
                            );
                          }
                        )}
                      </p>
                  }
                />
              </div>
            )
          )
        }
      </div>
    );
  }
}

interface DetailAppProps {
  id: string;
}

const dataStore = new AppDataStore('talks');

class DetailPageApp extends React.Component<DetailAppProps, {}> {
  private left: () => JSX.Element;
  private right: () => JSX.Element;
  private header: () => JSX.Element;

  constructor() {
    super();

    this.left = databind(
      dataStore.talks.onGet,
      dataStore.talks,
      (talk: Talk) => (<VideoPlayer {...talk} />)
    );

    this.right = databind(
      dataStore.talks.onMoreLikeThis,
      dataStore.talks,
      (talks: Talk[]) => (
        <MoreLikeThis 
          title="More Like This:"
          docs={talks} 
          render={
            (talk: Talk) => (
              talk.url_s.indexOf('youtube.com') > 0 ? (
                <table style={{ width: '100%' }}>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <VideoThumbnail 
                        talk={talk}
                        onClick={
                          () => (window as any).location = '/view/' + talk.id
                        }
                      />
                    </td>
                    <td>
                      <a 
                        href="#"
                        onClick={
                          () => (window as any).location = '/view/' + talk.id
                        }
                      >
                        <b>{talk.title_s}</b>
                      </a>
                    </td>
                  </tr>
                </table>
              ) : null
            )
          }
        />)
    );

    this.header = databind(
      dataStore.talks.onMoreLikeThis,
      dataStore.talks,
      (talk: Document) => (
        <SearchBox 
          placeholder="Search..."
          loading={false}
          sampleSearches={suggestions}
          transition={
            (params: SearchParams) => {
              (window as any).location = 'https://www.findlectures.com/?q=' + params.query.replace(/ /g, '%20');
            }
          }
        />
      )
    );
  }

  init() {
    dataStore.talks.doGet(this.props.id);
    dataStore.talks.doMoreLikeThis(this.props.id);
  }

  componentWillReceiveProps() {
    this.init();
  }

  componentDidMount() {
    this.init();

    const key = 'watched' + this.props.id;
    const today = new Date();
    window.localStorage[key] =       
      'Watched ' + 
      today.getDate() + 
      ' ' +
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][today.getMonth()] +
      ' ' +
      today.getFullYear();
  }

  componentWillUnmount() {
    // dataStore.clearEvents();
  }

  render() { 
    return (
      <DetailLayout 
        leftComponent={this.left}
        rightComponent={this.right}
        headerComponent={this.header}
      />
    );
  }
}

export { DetailPageApp };