import * as React from 'react';
import { get, toPairs, flatten, identity } from 'lodash';
import * as Radium from 'radium';

interface SelectedFiltersProps {
  title?: (facet: string) => string;
}

@Radium
class SelectedFilters extends React.Component<SelectedFiltersProps, {}> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };
  
  onClick(facet: string, value: string) {
    return () => {
      let selections: string[] = get(this.context.searchState.facets, facet, []);

      selections = selections.filter(
        (f) => f !== value
      );

      const thisFacet = {};
      thisFacet[facet] = selections;
      this.context.transition(
        {
          start: 0,
          facets: thisFacet
        }
      );
    };
  }

  render() {
    let lastType = '';
    let title = this.props.title || identity;

    const facetSelections = 
      flatten(
        toPairs(this.context.searchState.facets).map(
          ([facet, values]) => (values as string[]).map(
            (value) => [facet, value]
          )
        )
      ).map(
        ([facet, value], i) => {
          let display = lastType !== facet ? 
            (title(facet) + ': ' + value) : 
            value;

          lastType = facet;
         
          const iconStyle = {
            ':hover': {
              'transform': 'scale(1.5)'
            }
          };
          
          return (
            <div className="item" key={facet + '_' + value + '_' + i} onClick={this.onClick(facet, value)}>
              <i className="remove circle outline icon" key={facet + '_' + value + '_' + i} style={iconStyle} />
              <div className="content">
                <div className="header">{display}</div>
              </div>
            </div>
          );
        }
      );

    return (      
      <div className="ui mini horizontal list">
        {facetSelections}
      </div>
    );
  }
}

export { 
  SelectedFiltersProps,
  SelectedFilters 
};