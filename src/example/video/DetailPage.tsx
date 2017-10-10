import * as React from 'react';
import { DetailPage } from '../../pages/Detail';

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
          width="640"
          height="390"
          src={'http://www.youtube.com/embed/' + this.youtubeId(url)} 
        />
        <h2>{this.props.title_s}</h2>
      </div>
    );
  }
}

class DetailPageApp extends React.Component<{id: string}, {}> {
  render() {
    // TODO - the invidivual components should register what they need:
    //   Solr, core, fields
    return (
      <DetailPage 
        detailComponent={VideoPlayer}
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