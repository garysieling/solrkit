import { PaginationData, SearchParams, SolrCore, SolrMoreLikeThis, SolrGet, SolrTransitions } from './DataStore';
import * as React from 'react';
import { PropTypes } from 'react';
import * as _ from 'lodash';

type RenderLambda<T> = 
  (v: T | T[], p?: PaginationData) => JSX.Element;

function databind<T>(
    fn: Function,
    ds: SolrCore<object>,
    render: RenderLambda<T>
) {
  return () => {
    return (
      <DataBound
        fn={fn}
        dataStore={ds}
        render={render}
      />
    );
  };
}

interface DataBoundProps<T> {
  fn: Function;
  dataStore: SolrGet<T> & SolrMoreLikeThis<T> & SolrTransitions;
  render: RenderLambda<T>;
}

interface DataBoundState<T> {
  data?: T | T[];
  paging?: PaginationData;
}

class DataBound<T> extends React.Component<DataBoundProps<T>, DataBoundState<T>> {
  static childContextTypes = {
    transition: PropTypes.func,
    searchState: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: DataBoundProps<T>) {
    super(props);

    this.state = {
      data: undefined,
      paging: undefined
    };

    // This needs to happen early
    props.fn.call(
      props.dataStore,
      (data: T | T[], paging: PaginationData) => {
        this.setState( {
          data: data,
          paging: paging
        });
      }
    );
  }

  transition(args: SearchParams) {
    const currentParams = this.props.dataStore.getCurrentParameters();
    const newParams: SearchParams = Object.assign(
      {},
      currentParams,
      args      
    );

    if (args.facets) {
      newParams.facets = Object.assign({}, currentParams.facets, args.facets);      
    }

    console.log(newParams);

    // TODO - should handle different classes of route
    const page: number = (newParams.start || 0) / 10 + 1;

    let facets = '';
    if (newParams.facets) {
      facets = '?' + _.map(
        newParams.facets,
        (k, v) => v + '=' + k
      ).join('&');
    }
    
    this.context.router.history.push(
      '/search/' + newParams.query + '/' + 
      page + facets
    );

    this.props.dataStore.stateTransition(newParams);
  }

  getChildContext() {
    return {
      searchState: this.props.dataStore.getCurrentParameters(),
      transition: this.transition.bind(this)
    };
  }

  render() {
    // TODO these need to be named or something
    if (!this.state.data) {
      return null;
    }

    return (
      this.props.render(this.state.data || [], this.state.paging)
    );
  }
}

export { databind };