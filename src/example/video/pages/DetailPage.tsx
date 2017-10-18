import * as React from 'react';
import { DetailLayout } from '../../../layout/DetailLayout';
import { MoreLikeThis } from '../../../component/MoreLikeThis';
import { SearchBox } from '../../../component/SearchBox';
import { TalkSearchDataStore } from './talks/TalkSearchDataStore';
import { databind } from '../../../context/DataBinding';
import { Talk } from './talks/Talk';
import { suggestions } from './talks/suggestions';

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
      </div>
    );
  }
}

function ytId(url: string) {
  return url.split('v=')[1].split('&')[0];
}

interface DetailAppProps {
  id: string;
  load: (id: string) => void;
}

const dataStore: TalkSearchDataStore = new TalkSearchDataStore();

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
                      <a 
                        style={{paddingBottom: '10px', height: '12px'}}
                        href="#"
                        onClick={() => this.props.load(talk.id)}
                      >
                        <img 
                          style={{ width: '100%' }}
                          src={'https://img.youtube.com/vi/' + ytId(talk.url_s) + '/mqdefault.jpg'} 
                          alt={talk.title_s}
                        />
                      </a>
                    </td>
                    <td>                  
                      <div
                        onClick={() => this.props.load(talk.id)}
                      >
                        <b>{talk.title_s}</b>
                      </div>
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
      (talk: Talk) => (
        <SearchBox 
          initialQuery="" 
          placeholder="Search..."
          onDoSearch={(query: String) => {
            location.href = 'https://www.findlectures.com/?q=' + query;
          }}
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
    dataStore.clearEvents();
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