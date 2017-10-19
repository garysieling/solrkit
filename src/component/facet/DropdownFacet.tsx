import * as React from 'react';
import { Menu, Dropdown, DropdownItemProps } from 'semantic-ui-react';

interface DropdownFacetProps {
  title?: string;
  values: string[];
  name: string;
}

class DropdownFacet extends React.Component<DropdownFacetProps, {}> {
  render() {
    const title = this.props.title || '';

    const options: DropdownItemProps[] =
      this.props.values.map(
        (value, i) => {
          return { 
            key: i,
            text: value, 
            value: value 
          };
        }
      );

    return (
      <div className="ui" style={{marginBottom: '1em', display: 'block'}}>
        <Menu compact={true}>
          <Dropdown text={title} options={options} selection={true} closeOnBlur={true} simple={true} item={true} />
        </Menu>
      </div>
    );
  }
}

export {
  DropdownFacet
};