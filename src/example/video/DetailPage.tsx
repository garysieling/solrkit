import * as React from 'react';
import { DetailPage } from '../../pages/Detail';
// import { MoreLikeThis } from '../../components/MoreLikeThis';
import { SearchBox } from '../../components/SearchBox';
import { DataStore, SolrCore, SolrGet, SolrMoreLikeThis, SolrQuery } from '../../context/DataStore';

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
        <h2>
          {this.props.title_s}
        </h2>
      </div>
    );
  }
}

interface Talk {
  title_s: string;
  id: string;
  url: string;
}

// Ideally you want to write code like this:
// 
//  DataStore.books.get = (talk: Talk) => <Detail {...talk} />
//  bind(onClick, (e) => DataStore.books.get(e.target.value))
//
//  Which would suggest that...
//    We need a different type T for each core
//    get needs to be a property?
type TalkCoreCapabilities = SolrCore<Talk> & SolrGet<Talk> & SolrMoreLikeThis<Talk> & SolrQuery<Talk>;
class TalkSearchDataStore extends DataStore {
    private talksCore: TalkCoreCapabilities;

  // Every core should have it's own function
  // registered in your datastore
  //
  // If you want to have some UI controls use
  // different subsets of the data in the index
  // you should register one entry per use case.
  get talks(): TalkCoreCapabilities {
    if (!this.talksCore) {
      this.talksCore = super.registerCore({
        url: '',
        core: 'talks',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: ['title_s', 'url_s', 'id'],
      });
    }

    return this.talksCore;
  }
}

//const tds = new TalkSearchDataStore();
// Good spot for HOC here
/*tds.talks.onGet(
  () => this.setState()
)*/

class DetailPageApp extends React.Component<{id: string}, {}> {
  private dataStore: TalkSearchDataStore;

  constructor() {
    super();

    this.dataStore = new TalkSearchDataStore();
  }
  
  render() {
    // TODO - the invidivual components should register what they need:
    //   Solr, core, fields
    const left = (talk: Talk) => 
      <VideoPlayer {...talk} />;

    // mlt component
    const right = (talk: Talk) => (
      <div>
        {talk.title_s}
      </div>
    );

    // todo - maybe loading should just go in everything
    const header = () => ( 
      <SearchBox 
        initialQuery="" 
        placeholder="Search..."
        onDoSearch={(query: String) => {
          console.log('do search');
        }}
        loading={false}
        sampleSearches={[]}
      />
    );

    return (
      <DetailPage 
        leftComponent={left}
        rightComponent={right}
        headerComponent={header}
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