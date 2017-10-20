import * as React from 'react';
import { get, includes } from 'lodash';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class CheckFacet extends React.Component<FacetProps, {}> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

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
        {facets: thisFacet}
      );
    };
  }

  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    return (
      <div className="ui" style={{marginBottom: '1em'}}>
        {title ? (<h4>{title}</h4>) : null}
        {
          this.props.values.map(
            ([value, count, checked], i) => (
              <div style={{display: 'block'}} >
                <div className="ui checkbox">
                  <input onClick={this.onClick(value)} checked={checked} type="checkbox" name={i + ''} />
                  <label onClick={this.onClick(value)}>{render(value, count)}</label>
                </div>
              </div>
            )
          )
        }
      </div>
    );
  }
}

export {
  CheckFacet
};