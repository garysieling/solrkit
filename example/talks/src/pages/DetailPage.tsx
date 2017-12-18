import * as React from 'react';
import { AppDataStore } from './data/AppDataStore';
import { Document } from './data/Document';
import { suggestions } from './data/suggestions';
import { Link } from 'react-router-dom';

import { 
  databind,
  SearchBox,
  MoreLikeThis,
  DetailLayout
} from 'solrkit';

class VideoPlayer extends React.Component<Document, {}> {
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
      (talk: Document) => (<VideoPlayer {...talk} />)
    );

    this.right = databind(
      dataStore.talks.onMoreLikeThis,
      dataStore.talks,
      (talks: Document[]) => (
        <MoreLikeThis 
          title="More Like This:"
          docs={talks} 
          render={
            (talk: Document) => (
              talk.url_s.indexOf('youtube.com') > 0 ? (
                <table style={{ width: '100%' }}>
                  <tr>
                    <td style={{ width: '50%' }}>
                      <Link to={'/view/' + talk.id}>
                        <img 
                          style={{ width: '100%' }}
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