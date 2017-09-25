import * as React from 'react';
import { Card, Input } from 'semantic-ui-react';
//import * as _ from 'lodash';
import 'semantic-ui-css/semantic.min.css';

interface Property {
  name: string;
  display: string;
  type: string;
  default: string | string[] | number | number[] | boolean | object[];
}

interface PropertiesProps {
  properties: Property[]; 
}

interface PropertiesState {
}

class Properties extends React.Component<PropertiesProps, PropertiesState> {
  constructor() {
    super();
  }

  render() {
    const renderedProperties = 
      this.props.properties.map(
        (property: Property, i: number) => {
          return (
            <div key={i}>
              <b>{property.display}</b>
                <Input />
            </div>
          );
        }
      )

    return (
      // TODO layout component
      <Card style={{width: '400px'}}>
        {renderedProperties}
        {this.props.children}
      </Card>
    );
  }
}

export default Properties;