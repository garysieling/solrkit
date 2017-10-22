import * as React from 'react';
import { get, includes, take } from 'lodash';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

interface CheckFacetState {
  showMoreLink: boolean;
}

class CheckFacet extends React.Component<FacetProps, CheckFacetState> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  constructor() {
    super();

    this.state = {
      showMoreLink: true
    };

    this.onShowMore = this.onShowMore.bind(this);
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

  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    const noMore = !this.state.showMoreLink || this.props.values.length < 8;
    const values =
      (noMore) ? (
        this.props.values
      ) : (
        take(this.props.values, 5)
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
        {title ? (<h4>{title}</h4>) : null}
        {
          values.map(
            ([value, count, checked], i) => (
              <div style={{display: 'block'}} >
                <div className="ui checkbox">
                  <input 
                    onClick={this.onClick(value)} 
                    checked={checked} 
                    type="checkbox" 
                    name={i + ''} 
                  />
                  <label 
                    onClick={this.onClick(value)}
                    style={{cursor: 'pointer'}}
                  >
                    {render(value, count)}
                  </label>
                </div>
              </div>
            )
          )
        }
        {moreLink}
      </div>
    );
  }
}

export {
  CheckFacet
};