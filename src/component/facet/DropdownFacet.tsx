import * as React from 'react';
import { Menu, Dropdown, DropdownItemProps } from 'semantic-ui-react';
import * as _ from 'lodash';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class DropdownFacet extends React.Component<FacetProps, {}> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  onClick(value: string) {
    let selections: string[] = [value];

    const thisFacet = {};
    thisFacet[this.props.facet] = selections;

    this.context.transition(
      {
        start: 0,
        facets: thisFacet
      }
    );
  }

  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    const options: DropdownItemProps[] =
      _.sortBy(this.props.values, (v) => v[0]).map(
        ({value, count, checked}, i) => {
          return { 
            key: i,
            text: render(value, count), 
            value: value
          };
        }
      );

    let initialValue =
      _.get(this.context.searchState, 'facets.' + this.props.facet + '[0]', undefined);

    return (
      <div className="ui" style={{marginBottom: '1em', display: 'block'}}>
        <Menu compact={true}>
          <Dropdown 
            text={initialValue || title} 
            options={options} 
            selection={true} 
            closeOnBlur={true} 
            simple={true} 
            item={true} 
            value={initialValue}
            onChange={( e, {value} ) => this.onClick(value + '')} 
          />
        </Menu>
      </div>
    );
  }
}

export {
  DropdownFacet
};