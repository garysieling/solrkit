import { AutoConfiguredDataStore, SolrQuery } from 'solrkit';
import * as _ from 'lodash';

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
      },
      (facet: string) => {
        return !_.includes(
          [
            'birthDay_s',
            'deathDay_s',
            'deathDayAsString_s',
            'deathDayAsStringYear_s',
            'deathDayAsStringDecade_s',
            'deathDayAsStringCentury_s',
            'birthDayAsStringYear_s',
            'birthDayAsStringDecade_s',
            'birthDayAsStringCentury_s',
            'description_s',
            'wikipediaUrl_s',
            'image_s',
            'artistUrl_s',
            'id',
            'deathDayAsStringYear_s',
            'artistUrl_s',
            'birthDayAsString_s',
            'language',
            'title_s',
            'serie_s',
            'lastNameFirst_s'
          ], 
          facet
        );
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