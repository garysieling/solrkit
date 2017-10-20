import * as React from 'react';
import { Menu, Dropdown, DropdownItemProps } from 'semantic-ui-react';

import {
  FacetRenderer,
  defaultRenderer,
  FacetProps
} from './FacetTypes';

class DropdownFacet extends React.Component<FacetProps, {}> {
  render() {
    const title = this.props.title;
    const render: FacetRenderer = this.props.render || defaultRenderer;

    const options: DropdownItemProps[] =
      this.props.values.map(
        (value, i) => {
          return { 
            key: i,
            text: render(value[0], value[1]), 
            value: value[0]
          };
        }
      );

    return (
      <div className="ui" style={{marginBottom: '1em', display: 'block'}}>
        <Menu compact={true}>
          <Dropdown 
            text={title} 
            options={options} 
            selection={true} 
            closeOnBlur={true} 
            simple={true} 
            item={true} 
          />
        </Menu>
      </div>
    );
  }
}

export {
  DropdownFacet
};