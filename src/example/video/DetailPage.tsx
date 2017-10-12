import * as React from 'react';
import { DetailPage } from '../../pages/Detail';
import { MoreLikeThis } from '../../components/MoreLikeThis';
interface Talk {
  id: string;
  title_s: string;
  url_s: string;
}

class VideoPlayer extends React.Component<Talk, {}> {
  youtubeId(url: String) {
    return url.replace(/.*v=/, '');
  }

  render() {
    const url = this.props.url_s;

    if (this.props.url_s === '') {
      return null;
    }

    return (
      <div>
        <iframe 
          id="player" 
          width="100%"
          height="390"
          src={'http://www.youtube.com/embed/' + this.youtubeId(url)} 
        />
      </div>
    );
  }
}

class HeaderComponent extends React.Component<Talk, {}> {
  render() {
    return (
      <h2>
        {this.props.title_s}
      </h2>
    );
  }
}

class DetailPageApp extends React.Component<{id: string}, {}> {
  render() {
    // TODO - the invidivual components should register what they need:
    //   Solr, core, fields
    return (
      <DetailPage 
        leftComponent={VideoPlayer}
        rightComponent={MoreLikeThis}
        headerComponent={HeaderComponent}
        url="http://40.87.64.225:8983/solr/"
        core="talks"
        initial={{
          id: '',
          title_s: '',
          url_s: ''
        }}
        id={this.props.id}
      />
    );
  }
}

export { DetailPageApp };