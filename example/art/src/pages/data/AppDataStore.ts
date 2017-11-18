import { AutoConfiguredDataStore, SolrQuery } from 'solrkit';

class AppDataStore extends AutoConfiguredDataStore {
  constructor() {
    super();
  }

  init(complete: () => void) {
    super.autoconfigure(
      {
        url: 'http://40.87.64.225:8983/solr/',
        core: 'art'
      },
      () => {
        complete();
      }
    );
  }

  getCore(): SolrQuery<object> {
    return super.getCore();
  }

  getFacets() {
    return super.getFacets();
  }

  getFields() {
    return super.getFields();
  }

}

export { AppDataStore };