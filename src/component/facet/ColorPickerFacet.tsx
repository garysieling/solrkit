import * as React from 'react';
import { get, includes } from 'lodash';

import {
  Popup
} from 'semantic-ui-react';

import {
  FacetProps
} from './FacetTypes';

interface ColorPickerFacetState {
}

class ColorPickerFacet extends React.Component<FacetProps, ColorPickerFacetState> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  constructor() {
    super();

    this.state = {
    };
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

  render() {
    const title = this.props.title;
    const help = this.props.help;

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
        {
          
        }
      </div>
    );
  }
}

export {
  ColorPickerFacetState,
  ColorPickerFacet
};