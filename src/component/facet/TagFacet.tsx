import * as React from 'react';
import { Menu, Dropdown, DropdownItemProps } from 'semantic-ui-react';

interface TagFacetProps {
  title?: string;
  values: string[];
  name: string;
}

class TagFacet extends React.Component<TagFacetProps, {}> {
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
          <Dropdown 
            text={title} 
            multiple={true} 
            options={options} 
            simple={true}
            item={true} 
            fluid={true}
          />
        </Menu>
      </div>
    );
  }
}

export {
  TagFacet
};