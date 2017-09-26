import * as React from 'react';
import { Icon, Card, Input, Grid } from 'semantic-ui-react';
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
  flip: boolean;
}

class Properties extends React.Component<PropertiesProps, PropertiesState> {
  constructor() {
    super();

    this.state = {
      flip: false
    }

    this.onFlip = this.onFlip.bind(this);
  }

  onFlip() {
    this.setState({flip: !this.state.flip});
  }

  render() {
    const renderedProperties = 
      this.props.properties.map(
        (property: Property, i: number) => {
          return (
            <Grid.Row key={i}>
              <Grid.Column style={{width: '100px'}}>
                {property.display}
              </Grid.Column>
              <Grid.Column>
                <Input />
              </Grid.Column>
            </Grid.Row>
          );
        }
      )

    const view = 
      this.state.flip ? (
        <Grid.Row>
          <Grid.Column style={{width: '100px'}}>
            {this.props.children} 
          </Grid.Column>
        </Grid.Row>
        ) : 
        renderedProperties;
        
    return (
      // TODO layout component
        <Card style={{width: '300px'}}>
          <Grid columns={2}>
            {view}
          </Grid>        
          <Card.Content>
            <Card.Header>
              <Icon name="paint brush" onClick={this.onFlip} /> Pagination
            </Card.Header>
          </Card.Content>
        </Card>
    );
  }
}

export default Properties;