import * as React from 'react';
import { PropTypes } from 'react';

import { Search, SearchResultData, SearchProps } from 'semantic-ui-react';
import { take } from 'lodash';
import { SearchParams } from '../context/DataStore';

interface SearchBoxProps {
  placeholder: string;
  loading: boolean;
  sampleSearches?: string[];
  transition?: (params: SearchParams) => void;
}

interface SearchBoxState {
  query: string;
  shouldBeOpen: boolean;  
  searchEditedByUser: boolean;
}

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
  static contextTypes = {
    searchState: PropTypes.object,
    transition: PropTypes.func
  };

  state = {
    query: '',
    shouldBeOpen: false,
    searchEditedByUser: false
  };

  constructor() {
    super();

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChangeQuery = this.onChangeQuery.bind(this);
    this.onSelectTypeahead = this.onSelectTypeahead.bind(this);
  }

  onKeyUp(event: React.KeyboardEvent<object>) {
    event.preventDefault(); 

    if (event.keyCode === 13) { 
      this.onDoSearch(this.state.query);
      this.setState({shouldBeOpen: false});      
    } else if (event.keyCode === 27) { 
       this.setState({shouldBeOpen: false});
    }
  }

  onChangeQuery(e: React.MouseEvent<HTMLElement>, data: SearchProps) {
    this.setState(
      {
        query: data.value + '',
        shouldBeOpen: (data.value || '').length > 0,
        searchEditedByUser: true
      }
    );
  }

  onSelectTypeahead(e: React.MouseEvent<HTMLDivElement>, data: SearchResultData) {
    this.setState(
      {
        query: data.result.title,
        shouldBeOpen: false,
        searchEditedByUser: true
      }
    );

    this.onDoSearch(data.value + '');
  }

  onDoSearch(value: string) {
    const query: SearchParams = {
      query: value, 
      start: 0
    };

    if (this.props.transition) {
      this.props.transition(query);
    } else {
      this.context.transition(query);
    }
  }

  onBlur() {
    this.setState({shouldBeOpen: false});
  }

  render() {   
    const self = this;
    
    const query = 
      (self.state.searchEditedByUser ? 
        self.state.query :
        self.context.searchState ? 
          (
            self.context.searchState.query
          ) : ''
        ) || '';

    const lc = query.toLowerCase();
    const filteredSearches = take(
      (self.props.sampleSearches || []).filter(
        (search) => search.indexOf(lc) === 0
      ),
      5
    ).map(
      (title) => { return {title}; }
    );

    return (
      <Search
        className="full"
        id="searchBox"
        open={this.state.shouldBeOpen}
        loading={this.props.loading}
        onResultSelect={self.onSelectTypeahead}
        onSearchChange={self.onChangeQuery}
        results={filteredSearches}
        input={{fluid: true}}
        value={query}
        showNoResults={false}
        fluid={true}
        onKeyUp={self.onKeyUp}
        onBlur={self.onBlur}
        placeholder={this.props.placeholder}
        size="large"
      />  
    );
  }
}

export { 
  SearchBoxProps,
  SearchBoxState,
  SearchBox
};