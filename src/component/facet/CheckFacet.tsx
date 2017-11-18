import * as React from 'react';
import { get, includes, take, filter, orderBy } from 'lodash';

import {
  Popup
} from 'semantic-ui-react';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps,
  FacetValue
} from './FacetTypes';

interface CheckFacetState {
  showMoreLink: boolean;
  typeahead: string;
}

class CheckFacet extends React.Component<FacetProps & { search?: boolean }, CheckFacetState> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  constructor() {
    super();

    this.state = {
      showMoreLink: true,
      typeahead: ''
    };

    this.onShowMore = this.onShowMore.bind(this);
    this.onChangeTypeahead = this.onChangeTypeahead.bind(this);
  }

  onClick(value: string) {
    return () => {
      let selections: string[] = get(this.context.searchState.facets, this.props.facet, []);
      if (includes(selections, value)) {
        selections = selections.filter(
          (f) => f !== value
        );
      } else {
        selections.push(value);
      }

      const thisFacet = {};
      thisFacet[this.props.facet] = selections;
      this.context.transition(
        {
          start: 0,
          facets: thisFacet
        }
      );
    };
  }

  onShowMore() {
    this.setState({showMoreLink: false});
  }

  onChangeTypeahead(event: React.SyntheticEvent<HTMLInputElement>) {
    this.setState({typeahead: event.currentTarget.value});
  }

  render() {
    const title = this.props.title;
    const help = this.props.help;
    const renderValue: FacetRenderer = this.props.render || defaultRenderer;

    const searchBox = this.props.search ? (
      <form className="ui mini form">
        <div className="field" style={{ paddingBottom: '3px', width: '70%' }}>
          <input type="text" placeholder="Filter" onChange={this.onChangeTypeahead} />
        </div>
      </form>
    ) : null;

    const valueList =
      this.props.search && this.state.typeahead.length > 0 ? (
        filter(
          this.props.values,
          (v) => v[0].startsWith(this.state.typeahead)
        )
      ) : (
        this.props.values
      );

    const noMore = !this.state.showMoreLink || valueList.length < 8;
    const displayValues =
      (noMore) ? (
        valueList
      ) : (
        take(valueList, 5)
      );

    const moreLink =
      noMore ? (
        null
      ) : (
        <div 
          style={{display: 'block', cursor: 'pointer'}}
          onClick={this.onShowMore}
        >
          Show More
        </div>
      );

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (
          help ? (
            <Popup 
              trigger={<h4>{title}</h4>}
              content={help}
            />) :
          <h4>{title}</h4>)
          : null}
        {searchBox}
        {
          orderBy(displayValues, ['checked', 'count'], ['desc', 'desc']).map(
            (thisFacet: FacetValue, i) => {
              let { value, count, checked } = thisFacet;
              
              return (
                <div key={i} style={{display: 'block'}} >
                  <div key="cb" className="ui checkbox">
                    <input 
                      key="input"
                      onClick={this.onClick(value)} 
                      checked={checked} 
                      type="checkbox" 
                      name={i + ''} 
                    />
                    <label 
                      key="label"
                      onClick={this.onClick(value)}
                      style={{cursor: 'pointer'}}
                    >
                      {renderValue(value, count)}
                    </label>
                  </div>
                </div>
              )
            }
          )
        }
        {moreLink}
      </div>
    );
  }
}

export {
  CheckFacetState,
  CheckFacet
};