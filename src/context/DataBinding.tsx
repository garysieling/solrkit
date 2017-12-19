import { 
  PaginationData, 
  SearchParams, 
  SolrCore, 
  SolrMoreLikeThis, 
  SolrGet, 
  SolrQuery, 
  SolrTransitions 
} from './DataStore';
import * as React from 'react';
import { PropTypes } from 'react';
import * as _ from 'lodash';

type RenderLambda<T> = 
  (v: T | T[], p?: PaginationData) => JSX.Element;

function databind<T>(
    event: Function,
    ds: SolrCore<object>,
    render: RenderLambda<T>,
    transition?: (sp: SearchParams) => Boolean
) {
  return () => {
    return (
      <Bound
        event={event}
        dataStore={ds}
        render={render}
        transition={transition}
      />
    );
  };
}

interface DataBoundProps<T> {
  event: Function;
  dataStore: SolrGet<T> & SolrMoreLikeThis<T> & SolrQuery<T> & SolrTransitions;
  render: RenderLambda<T>;
  transition?: (params: SearchParams) => Boolean;
}

interface DataBoundState<T> {
  data?: T | T[];
  paging?: PaginationData;
}

class Bound extends React.Component<DataBoundProps<object>, DataBoundState<object>> {
  static childContextTypes = {
    transition: PropTypes.func,
    searchState: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: DataBoundProps<object>) {
    super(props);

    this.state = {
      data: undefined,
      paging: undefined
    };

    // This needs to happen early
    // If this isn't bound to a specific event (e.g. a facet) just notify
    // the control when there are new search results.
    (props.event || props.dataStore.onQuery).call(
      props.dataStore,
      (data: object | object[], paging: PaginationData) => {
        this.setState( {
          data: data,
          paging: paging
        });
      }
    );
  }

  transition(args: SearchParams) {
    if (this.props.transition) {
      if (this.props.transition(args)) {
        return;
      }
    }

    const currentParams = this.props.dataStore.getCurrentParameters();
    const newParams: SearchParams = _.extend(
      {},
      currentParams,
      args      
    );

    if (args.facets) {
      newParams.facets = _.extend({}, currentParams.facets, args.facets);      
    }

    // TODO - should handle different classes of route
    const page: number = (newParams.start || 0) / this.props.dataStore.getCoreConfig().pageSize + 1;

    let facets = '';
    if (newParams.facets) {
      facets = '?' + _.map(
        newParams.facets,
        (k, v) => v + '=' + (
          _.isArray(k) ? k.join(',') : k
        )
      ).join('&');
    }
    
    this.context.router.history.push(
      '/' + this.props.dataStore.getCoreConfig().prefix + '/' + newParams.query + '/' + 
      page + facets
    );
  }

  getChildContext() {
    return {
      searchState: this.props.dataStore.getCurrentParameters(),
      transition: this.transition.bind(this)
    };
  }

  render() {
    // TODO these need to be named or something
    return (
      this.props.render(this.state.data || [], this.state.paging || { numFound: 0, start: 0, pageSize: 10 })
    );
  }
}

class DataBind extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export { 
  RenderLambda,
  DataBoundProps,
  DataBoundState,
  DataBind,
  Bound, 
  databind 
};