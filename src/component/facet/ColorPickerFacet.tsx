import * as React from 'react';
import { get, includes } from 'lodash';
import { Dropdown } from 'semantic-ui-react';
import * as d3 from 'd3';
import * as tinycolor from 'tinycolor2';

import 'd3-scale';
import 'd3-svg';
import 'd3-brush';
import 'd3-drag';

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
  mode: string;
  colors: string[];
} 

const Modes = {
  CUSTOM: 'Custom',
  ANALOGOUS: 'Analogous',
  COMPLEMENTARY: 'Complementary',
  TRIAD: 'Triad',
  TETRAD: 'Tetrad',
  MONOCHROMATIC: 'Monochromatic',
  SHADES: 'Shades',
};

// Simple range mapping function
// For example, mapRange(5, 0, 10, 0, 100) = 50
/*function mapRange(value: number, fromLower: number, fromUpper: number, toLower: number, toUpper: number) {
  return (toLower + (value - fromLower) * ((toUpper - toLower) / (fromUpper - fromLower)));
}

// These two functions are ripped straight from Kuler source.
// They convert between scientific hue to the color wheel's "artistic" hue.
function artisticToScientificSmooth(hue: number) {
  return (
    hue < 60  ? hue * (35 / 60) :
    hue < 122 ? mapRange(hue, 60,  122, 35,  60) :
    hue < 165 ? mapRange(hue, 122, 165, 60,  120) :
    hue < 218 ? mapRange(hue, 165, 218, 120, 180) :
    hue < 275 ? mapRange(hue, 218, 275, 180, 240) :
    hue < 330 ? mapRange(hue, 275, 330, 240, 300) :
                mapRange(hue, 330, 360, 300, 360));
}

function scientificToArtisticSmooth(hue: number) {
  return (
    hue < 35  ? hue * (60 / 35) :
    hue < 60  ? mapRange(hue, 35,  60,  60,  122) :
    hue < 120 ? mapRange(hue, 60,  120, 122, 165) :
    hue < 180 ? mapRange(hue, 120, 180, 165, 218) :
    hue < 240 ? mapRange(hue, 180, 240, 218, 275) :
    hue < 300 ? mapRange(hue, 240, 300, 275, 330) :
                mapRange(hue, 300, 360, 330, 360));
}*/
/*
function markerDistance(i: number) {
  return Math.ceil(i / 2) * Math.pow(-1, i + 1);
}

function stepFn(base: number) {
  return function (x: number) { return Math.floor(x / base); };
}*/

class ColorPickerFacet extends React.Component<FacetProps, ColorPickerFacetState> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  container: any;
  dispatch: any;
  slice: any;

  options: {
    radius: number;
    margin: number;
    markerWidth: number;
    defaultSlice: number;
    initRoot: string;
    baseClassName: string;
  } = {
    radius: 175,
    margin: 0, // space around the edge of the wheel
    markerWidth: 5,
    defaultSlice: 20,
    initRoot: 'red',
    baseClassName: 'colorwheel',
  };

  constructor() {
    super();

    this.state = {
      mode: Modes.ANALOGOUS,
      colors: []
    };

    this.dispatch = d3.dispatch(
      // Markers datum has changed, so redraw as necessary, etc.
      'markersUpdated',

      // "updateEnd" means the state of the ColorWheel has been finished updating.
      'updateEnd',

      // Initial data was successfully bound.
      'bindData',

      // The mode was changed
      'modeChanged'
    );

    this.pickColor = this.pickColor.bind(this);
  }
  
  render() {
    const title = this.props.title;
    const help = this.props.help;

    // <image width="350" height="350" href="http://benknight.github.io/kuler-d3/wheel.png" />

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
            {
              this.state.colors.map(
                (color: string) => (
                  <div style={{width: 10, height: 10, float: 'left', backgroundColor: color}} />
                )
              )
            }
            <svg 
              ref={(svg) => this.container = svg} 
              className="colorwheel" 
              width="160" 
              height="160" 
              viewBox="-30 -30 420 420"
              onClick={this.pickColor}
            >
              <g>
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="10, 6" x2="350" y2="175" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="10, 6" x2="125.55000305175781" y2="221.22500610351562" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="10, 6" x2="47.15779716907171" y2="55.49530898188226" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="10, 6" x2="186.54407515803408" y2="3.9569560828419696" visibility="visible" />
                  <line className="colorwheel-marker-trail" x1="175" y1="175" stroke="steelblue" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="10, 6" x2="186.78432942473347" y2="349.6027765529785" visibility="visible" />
              </g>
              <g>
                  <g className="colorwheel-marker root" visibility="visible" transform="translate(350,175)">
                    <circle r="20" stroke="steelblue" strokeWidth="2" strokeOpacity="0.9" cursor="move" fill="#ff0000" />
                    <text x="28" y="5" fill="steelblue" fontSize="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(125.55000305175781,221.22500610351562)">
                    <circle r="20" stroke="steelblue" strokeWidth="2" strokeOpacity="0.9" cursor="move" fill="#9cf6ff" />
                    <text x="28" y="5" fill="steelblue" fontSize="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(47.15779716907171,55.49530898188226)">
                    <circle r="20" stroke="steelblue" strokeWidth="2" strokeOpacity="0.9" cursor="move" fill="#a6ff00" />
                    <text x="28" y="5" fill="steelblue" fontSize="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(186.54407515803408,3.9569560828419696)">
                    <circle r="20" stroke="steelblue" strokeWidth="2" strokeOpacity="0.9" cursor="move" fill="#ffc305" />
                    <text x="28" y="5" fill="steelblue" fontSize="13px" />
                  </g>
                  <g className="colorwheel-marker" visibility="visible" transform="translate(186.78432942473347,349.6027765529785)">
                    <circle r="20" stroke="steelblue" strokeWidth="2" strokeOpacity="0.9" cursor="move" fill="#0005ff" />
                    <text x="28" y="5" fill="steelblue" fontSize="13px" />
                  </g>
              </g>
            </svg>
          </div>  
        }
      </div>
    );
  }

  pickColor(elt: any) {
    const newColors = {
      colors: [
        tinycolor.fromRatio(
          {
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
          }
        ),
        tinycolor.fromRatio(
          {
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
          }
        )
      ]
    };

    const searchTerms = 
      newColors.colors.map(
        (color) => {
          const cm = color.toRgb();
          return (
            Math.round(cm.r / 32.0) * 8 * 8 +
            Math.round(cm.g / 32.0) * 8 +
            Math.round(cm.b / 32.0)
          );
        }
      );

    this.context.transition(
      {
        start: 0,
        boost: searchTerms.join(' ')
      }
    );

    this.setState(newColors);
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

 /* private cx(className: string) {
    return this.options.baseClassName + '-' + className;
  }

  private selector(className: string) {
    return '.' + this.cx(className);
  }

  private getVisibleMarkers() {
    return this.container.selectAll(this.selector('marker') + '[visibility=visible]');
  }

  private cartesianToSVG(x: number, y: number) {
    return {'x': x + this.options.radius, 'y': this.options.radius - y};
  }

  private svgToCartesian(x: number, y: number) {
    return {'x': x - this.options.radius, 'y': this.options.radius - y};
  }

  private pointOnCircle(x: number, y: number) {
    const p = this.svgToCartesian(x, y);
    if (Math.sqrt(p.x * p.x + p.y * p.y) <= this.options.radius) {
      return {'x': x, 'y': y};
    } else {
      const theta = Math.atan2(p.y, p.x);
      const x2 = this.options.radius * Math.cos(theta);
      const y2 = this.options.radius * Math.sin(theta);
      return this.cartesianToSVG(x2, y2);
    }
  }  

  private getHSFromSVGPosition(x: number, y: number) {
    const p = this.svgToCartesian(x, y);
    const theta = Math.atan2(p.y, p.x);
    const artisticHue = (theta * (180 / Math.PI) + 360) % 360;
    const scientificHue = artisticToScientificSmooth(artisticHue);
    const s = Math.min(Math.sqrt(p.x * p.x + p.y * p.y) / this.options.radius, 1);
    
    return {h: scientificHue, s: s};
  }

  private getRootMarker() {
    return this.container.select(this.selector('marker') + '[visibility=visible]');
  }

  private getMarkers() {
    return this.container.selectAll(this.selector('marker'));
  }

  private setHarmony() {
    const self = this;
    const root = this.getRootMarker();
    const offsetFactor = 0.08;
    self.getMarkers().classed('root', false);
    if (! root.empty()) {
      const rootHue = scientificToArtisticSmooth(root.datum().color.h);
      switch (self.state.mode) {
        case Modes.ANALOGOUS:
          root.classed('root', true);
          this.getVisibleMarkers().each(function (d: any, i: number) {
            const newHue = (rootHue + (markerDistance(i) * self.slice) + 720) % 360;
            d.color.h = artisticToScientificSmooth(newHue);
            d.color.s = 1;
            d.color.v = 1;
          });
          break;
        case Modes.MONOCHROMATIC:
        case Modes.SHADES:
          this.getVisibleMarkers().each(function (d: any, i: number) {
            d.color.h = artisticToScientificSmooth(rootHue);
            if (self.state.mode === Modes.SHADES) {
              d.color.s = 1;
              d.color.v = 0.25 + 0.75 * Math.random();
            } else {
              d.color.s = 1 - (0.15 * i + Math.random() * 0.1);
              d.color.v = 0.75 + 0.25 * Math.random();
            }
          });
          break;
        case Modes.COMPLEMENTARY:
          this.getVisibleMarkers().each(function (d: any, i: number) {
            const newHue = (rootHue + ((i % 2) * 180) + 720) % 360;
            d.color.h = artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * stepFn(2)(i);
            d.color.v = 1;
          });
          break;
        case Modes.TRIAD:
          this.getVisibleMarkers().each(function (d: any, i: number) {
            const newHue = (rootHue + ((i % 3) * 120) + 720) % 360;
            d.color.h = artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * stepFn(3)(i);
            d.color.v = 1;
          });
          break;
        case Modes.TETRAD:
          this.getVisibleMarkers().each(function (d: any, i: number) {
            const newHue = (rootHue + ((i % 4) * 90) + 720) % 360;
            d.color.h = artisticToScientificSmooth(newHue);
            d.color.s = 1 - offsetFactor * stepFn(4)(i);
            d.color.v = 1;
          });
          break;
        default:
          throw 'Unknown mode';
      }
      this.dispatch.markersUpdated();
    }
  }

  private updateHarmony(target: any, theta: number) {
    const self = this;

    // Find out how far the dragging marker is from the root marker.
    let cursor = target;
    let counter = 0;
    while (cursor = cursor.previousSibling) {
      if (cursor.getAttribute('visibility') !== 'hidden') {
        counter++;
      }
    }
    const targetDistance = markerDistance(counter);

    switch (this.state.mode) {
      case Modes.ANALOGOUS:
        this.getVisibleMarkers().each(function (d: any, i: number) {
          // "this" might have been a different DOM element before...
          const startingHue = parseFloat(d3.select(self.container).attr('data-startingHue'));
          let slices = 1;
          if (targetDistance !== 0) {
            slices = markerDistance(i) / targetDistance;
          }
          if (self !== target) {
            d.color.h = artisticToScientificSmooth(
              (startingHue + (slices * theta) + 720) % 360
            );
          }
        });
        break;
      case Modes.MONOCHROMATIC:
      case Modes.COMPLEMENTARY:
      case Modes.SHADES:
      case Modes.TRIAD:
      case Modes.TETRAD:
        this.getVisibleMarkers().each(function (d: any) {
          const startingHue = parseFloat(d3.select(self.container).attr('data-startingHue'));
          d.color.h = artisticToScientificSmooth((startingHue + theta + 720) % 360);
          if (self.state.mode === Modes.SHADES) {
            d.color.s = 1;
          }
        });
        break;
      default:
        throw 'Unknown mode';
    }
    self.dispatch.markersUpdated();
  }

  private getDragBehavior() {
    const self = this;
    return d3.drag()
      .on('drag', function (d: any) {
        let pos, hs, p, dragHue, startingHue, theta1, theta2;
        pos = self.pointOnCircle(d3.event.x, d3.event.y);
        hs = self.getHSFromSVGPosition(pos.x, pos.y);
        d.color.h = hs.h;
        d.color.s = hs.s;
        p = self.svgToCartesian(d3.event.x, d3.event.y);
        dragHue = ((Math.atan2(p.y, p.x) * 180 / Math.PI) + 720) % 360;
        startingHue = parseFloat(d3.select(self.container).attr('data-startingHue'));
        theta1 = (360 + startingHue - dragHue) % 360;
        theta2 = (360 + dragHue - startingHue) % 360;
        self.updateHarmony(self, theta1 < theta2 ? -1 * theta1 : theta2);
      })
      .on('dragstart', function () {
        self.getVisibleMarkers().attr('data-startingHue', function (d) {
          return scientificToArtisticSmooth(d.color.h);
        });
      })
      .on('dragend', function () {
        let visibleMarkers = self.getVisibleMarkers();
        visibleMarkers.attr('data-startingHue', null);
        if (self.state.mode === Modes.ANALOGOUS) {
          const rootTheta = scientificToArtisticSmooth(d3.select(visibleMarkers[0][0]).datum().color.h);
          if (visibleMarkers[0].length > 1) {
            const neighborTheta = scientificToArtisticSmooth(d3.select(visibleMarkers[0][1]).datum().color.h);
            self.slice = (360 + neighborTheta - rootTheta) % 360;
          }
        }
        self.dispatch.updateEnd();
      });
  }*/
}

export {
  ColorPickerFacetState,
  ColorPickerFacet
};