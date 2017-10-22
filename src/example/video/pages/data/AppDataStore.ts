import { DataStore, SolrCore, SolrGet, SolrMoreLikeThis, SolrQuery } from '../../../../context/DataStore';
import { Document } from './Document';
// Ideally you want to write code like this:
// 
//  DataStore.books.get = (talk: Talk) => <Detail {...talk} />
//  bind(onClick, (e) => DataStore.books.get(e.target.value))
//
//  Which would suggest that...
//    We need a different type T for each core
//    get needs to be a property?
type CoreCapabilities = SolrCore<Document> & SolrGet<Document> & SolrMoreLikeThis<Document> & SolrQuery<Document>;
class AppDataStore extends DataStore {
  private core: CoreCapabilities;

  constructor() {
    super();
  }

  // Every core should have it's own function
  // registered in your datastore
  //
  // If you want to have some UI controls use
  // different subsets of the data in the index
  // you should register one entry per use case.
  get talks(): CoreCapabilities {
    if (!this.core) {
      this.core = super.registerCore({
        url: 'http://40.87.64.225:8983/solr/',
        core: 'talks',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: ['title_s', 'url_s', 'id'],
        defaultSearchFields: ['title_s', 'auto_transcript_txt_en'],
        pageSize: 10
      });
    }

    return this.core;
  }
}

export { AppDataStore };