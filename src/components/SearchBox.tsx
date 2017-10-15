import * as React from 'react';

import { Search, SearchResultData, SearchProps } from 'semantic-ui-react';
import { take } from 'lodash';

interface SearchBoxProps {
  initialQuery: string;
  placeholder: string;
  onDoSearch: (query: string) => void;
  loading: boolean;
  sampleSearches: string[];
}

interface SearchBoxState {
  query: string;
  shouldBeOpen: boolean;  
  searchEditedByUser: boolean;
}

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
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
      this.props.onDoSearch(this.state.query);
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
        query: data.value + '',
        shouldBeOpen: false,
        searchEditedByUser: true
      }
    );

    this.props.onDoSearch(data + '');
  }

  onBlur() {
    this.setState({shouldBeOpen: false});
  }

  render() {   
    const self = this;
    
    const query = 
      (self.state.searchEditedByUser ? 
        self.state.query :
        self.props.initialQuery) || '';

    const lc = query.toLowerCase();
    const filteredSearches = take(
      (self.props.sampleSearches || []).filter(
        (search) => search.indexOf(lc) === 0
      ),
      5
    ).map(
      (title) => {return {title}}
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
  SearchBox,
  SearchBoxProps
};