import * as React from 'react';
import { AppDataStore } from './data/AppDataStore';
import { Talk, Book } from './data/Document';
import { suggestions } from './data/suggestions';
import { Link } from 'react-router-dom';
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

function ytId(url: string) {
  return url.split('v=')[1].split('&')[0];
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
                      <Link to={'/view/' + talk.id}>
                        <img 
                          style={{ 
                            width: '100%',
                            borderRadius: '5px'
                          }}
                          src={'https://img.youtube.com/vi/' + ytId(talk.url_s) + '/mqdefault.jpg'} 
                          alt={talk.title_s}
                        />
                      </Link>
                    </td>
                    <td>
                      <Link to={'/view/' + talk.id}>
                        <b>{talk.title_s}</b>
                      </Link>
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
              console.log(params);
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
    window.localStorage[key] = true;  
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