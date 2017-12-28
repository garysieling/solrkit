import { DataStore, SolrCore, SolrGet, SolrQuery, SolrMoreLikeThis } from 'solrkit';

import { Talk, Book } from './Document';
// Ideally you want to write code like this:
// 
//  DataStore.books.get = (talk: Talk) => <Detail {...talk} />
//  bind(onClick, (e) => DataStore.books.get(e.target.value))
//
//  Which would suggest that...
//    We need a different type T for each core
//    get needs to be a property?
type TalkCapabilities = SolrCore<Talk> & SolrGet<Talk> & SolrMoreLikeThis<Talk> & SolrQuery<Talk>;
type BookCapabilities = SolrCore<Book> & SolrQuery<Book>;
class AppDataStore extends DataStore {
  private talkCore: TalkCapabilities;
  private bookCore: BookCapabilities;

  private page: string = '';

  constructor(page: string) {
    super();

    this.page = page;
  }

  // Every core should have it's own function
  // registered in your datastore
  //
  // If you want to have some UI controls use
  // different subsets of the data in the index
  // you should register one entry per use case.
  get talks(): TalkCapabilities {
    if (!this.talkCore) {
      this.talkCore = super.registerCore({
        url: 'http://40.87.64.225:8983/solr/',
        core: 'talks',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: [
          'title_s', 
          'speakerName_ss',
          'url_s', 
          'id'
        ],
        defaultSearchFields: [
          'title_s', 
          'auto_transcript_txt_en'
        ],
        pageSize: 16,
        prefix: this.page,
        qt: 'tvrh'
      });
    }

    return this.talkCore;
  }

  get books(): BookCapabilities {
    if (!this.bookCore) {
      this.bookCore = super.registerCore({
        url: 'http://40.87.64.225:8983/solr/',
        core: 'books',
        primaryKey: 'id',
        // Unfortunately these have to be repeated 
        // since there is no apparent way to sync
        // this with Typescript
        fields: [
          'title_s', 
          'thumbnail_url_s', 
          'author_key_s',
          'id'
        ],
        defaultSearchFields: [
          'author_name_ss'
        ],
        pageSize: 5
      });
    }

    return this.bookCore;
  }
}

export { AppDataStore };