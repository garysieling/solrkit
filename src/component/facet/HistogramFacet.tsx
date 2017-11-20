import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';

import 'd3-scale';
import 'd3-svg';
import 'd3-brush';

import { FacetProps, FacetValue } from './FacetTypes';

let margin = {top: 0, right: 5, bottom: 50, left: 5},
    width = 180 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

let histogramStyle = {
  'width': width,
  'height': height + 35,
};

interface HistogramFacetProps extends FacetProps {
  max?: number;
  min?: number;

  precision?: number;

  values: FacetValue[];
}

function getData(props: HistogramFacetProps) {
  return _.sortBy(
    props.values.map(
      (value: FacetValue) => [parseInt(value.value, 10), value.count]
    ).map(
      (value: number[]) => [value[0], Math.log(1 + value[1])]
    ), 
    (row) => row[0]
  );
}

class HistogramFacet extends React.Component<HistogramFacetProps, {}> {
  static contextTypes = {
    searchState: React.PropTypes.object,
    transition: React.PropTypes.func
  };

  svg: any;
  x: any;
  y: any;
  line: any;
  xAxis: any;
  area: any;
  brush: any;
  dom: HTMLDivElement | null;

  shouldComponentUpdate() {
    return false;
  }
  
  constructor(props: HistogramFacetProps) {
    super(props);
        
    let data: number[][] = getData(props);      

    const x = d3.scaleLinear()
            .range([width, 0]),
          y = d3.scaleLinear()
            .range([height, 0]);
                         
    const xAxis = d3.axisBottom(x);

    const area = d3.area()
        .x((d: [number, number]) => x(d[0]))
        .y0(height)
        .y1((d: [number, number]) => y(d[1]));
            
    const line = d3.line()
      .x((d: [number, number]) => x(d[0]))
      .y((d: [number, number]) => y(d[1]));

    const xmin = 
      props.min !== undefined ? 
      props.min : 
      d3.min(data, (d: number[]) => d[0]);
      
    const xmax = 
      props.max !== undefined ? 
      props.max :
      d3.max(data, (d: number[]) => d[0]);
      
    const max: number = d3.max(
      data, 
      (d: [number, number]) => d[1]) || 0;

    x.domain([xmax || 0, xmin || 0]);
    y.domain([
      0, 
      max
    ]);
            
    const brush = d3.brushX()
      .extent([[0, 0], [width, height + 2]])
      .on('end', this.brushend.bind(this));
          
    this.x = x;
    this.y = y;
    this.line = line;
    this.xAxis = xAxis;
    this.area = area;
    this.brush = brush;
  }

  render() {
    const title = this.props.title;
    return (
      <div>
        <h4>{title}</h4>
        <div ref={(dom) => {this.dom = dom; }} style={histogramStyle} />
      </div>
    );
  }

  componentDidMount() { 
    let data: number[][] = getData(this.props);
    
    this.svg = 
      d3.select(this.dom)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .style('font', '10px sans-serif')          
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.svg.append('path')
       .datum(data)
       .attr('class', 'area')
       .style('fill', 'steelblue')
       .style('clipPath', 'url(#clip)')
       .attr('d', this.area);
        
    this.svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .style('fill', 'none')
      .style('stroke', '#000')
      .style('shapeRendering', 'crispEdges')
      .attr('d', this.line);
      
    this.svg.append('g')
       .attr('class', 'x brush')
       .call(this.brush);

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis)
        .selectAll('text')
        .attr('y', 0)
        .attr('x', 20)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(90)');
  }  

  componentWillReceiveProps(nextProps: HistogramFacetProps) {
    let data: number[][] = getData(nextProps);

    this.y.domain([0, d3.max(data, (d) => d[1])]);            
   
    this.svg
        .select('.area')
          .datum(data)
          .transition()
          .duration(300)
          .attr('d', this.area);
       /* .select('g')
          .call(this.brush)
          .selectAll('rect')
          .transition()
          .duration(300)
          .attr('y', -6)
          .attr('height', height + 7)
          ;*/
 
    this.svg
      .select('.line')
      .datum(data)
      .transition()
      .duration(300)
      .attr('d', this.line);
  }

  brushend() {
    let ext = d3.event.selection;
    let val0 = ext[0];
    let val1 = ext[1]; // todo rounding might need to be configurable
    if (val1 > val0) {
      let selections: string[] = getData(this.props).filter(
        (value, i) => i >= val0 && i <= val1
      ).map(
        ([value, count], i) => value + ''
      );
      
      const thisFacet = {};
      thisFacet[this.props.facet] = selections;

      this.context.transition(
        {
          start: 0,
          facets: thisFacet
        }
      );
    }
  }
}

export { 
  HistogramFacetProps,
  HistogramFacet 
};