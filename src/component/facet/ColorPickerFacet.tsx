import * as React from 'react';
import { get, includes } from 'lodash';
import { Dropdown } from 'semantic-ui-react';

import {
  Popup
} from 'semantic-ui-react';

import {
  FacetProps
} from './FacetTypes';

const types = ['Analogous', 'Complementary', 'Triad', 'Tetrad', 'Monochromatic'].map(
  (value, i) => {
    return {
      key: i,
      text: value, 
      value: value
    };
  }
);

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
          <div>
            <Dropdown 
              options={types} 
              selection={true} 
              closeOnBlur={true} 
              simple={true} 
              item={true} 
              value={'Analogous'}
              onChange={( e, {value} ) => this.onClick(value + '')} 
            />
            <svg className="colorwheel" width="160" height="160" viewBox="-30 -30 420 420">
              <image width="350" height="350" href="http://benknight.github.io/kuler-d3/wheel.png" />
              <g>
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="10, 6" x2="350" y2="175" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="10, 6" x2="125.55000305175781" y2="221.22500610351562" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="10, 6" x2="47.15779716907171" y2="55.49530898188226" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="10, 6" x2="186.54407515803408" y2="3.9569560828419696" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" stroke-opacity="0.75" stroke-width="3" stroke-dasharray="10, 6" x2="186.78432942473347" y2="349.6027765529785" visibility="visible" />
              </g>
              <g>
                  <g className="colorwheel-marker root" visibility="visible" transform="translate(350,175)">
                    <circle r="20" stroke="steelblue" stroke-width="2" stroke-opacity="0.9" cursor="move" fill="#ff0000" />
                    <text x="28" y="5" fill="steelblue" font-size="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(125.55000305175781,221.22500610351562)">
                    <circle r="20" stroke="steelblue" stroke-width="2" stroke-opacity="0.9" cursor="move" fill="#9cf6ff" />
                    <text x="28" y="5" fill="steelblue" font-size="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(47.15779716907171,55.49530898188226)">
                    <circle r="20" stroke="steelblue" stroke-width="2" stroke-opacity="0.9" cursor="move" fill="#a6ff00" />
                    <text x="28" y="5" fill="steelblue" font-size="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(186.54407515803408,3.9569560828419696)">
                    <circle r="20" stroke="steelblue" stroke-width="2" stroke-opacity="0.9" cursor="move" fill="#ffc305" />
                    <text x="28" y="5" fill="steelblue" font-size="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(186.78432942473347,349.6027765529785)">
                    <circle r="20" stroke="steelblue" stroke-width="2" stroke-opacity="0.9" cursor="move" fill="#0005ff" />
                    <text x="28" y="5" fill="steelblue" font-size="13px" />
                  </g>
              </g>
            </svg>
          </div>  
        }
      </div>
    );
  }
}

export {
  ColorPickerFacetState,
  ColorPickerFacet
};