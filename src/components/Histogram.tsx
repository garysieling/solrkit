import * as React from 'react';
import * as d3 from 'd3';
import * as Guid from 'guid';

import 'd3-scale';
import 'd3-svg';
import 'd3-brush';

let margin = {top: 0, right: 20, bottom: 35, left: 10},
    width = 180 - margin.left - margin.right,
    height = 80 - margin.top - margin.bottom;

let histogramStyle = {
  'width': width,
  'height': (height + 25)
};

interface HistogramProps {
  max: number;
  min: number;

  precision: number;

  factor: number;
  parse: (v: string) => number;
  data: [number, number, boolean][];
  facetHandler: (a: [number | string, number | string]) => void;
}

// TODO move into own file
const HistogramProperties = [
  {
    name: 'data',
    display: 'Data',
    type: 'object[]'
  }
  // TODO option for LOG
  // TODO documenation extractor
];

class Histogram extends React.Component<HistogramProps, {}> {
  id: string;
  svg: any;
  x: any;
  y: any;
  line: any;
  xAxis: any;
  area: any;
  brush: any;

  shouldComponentUpdate() {
    return false;
  }
  
  constructor() {
    super();

    const self = this;  

    this.id = Guid.create().value.replace(/-/g, '');
         
    let data: number[][] = []; 
    if (this.props.factor) {
      data = data.map(
        (value: number[]) => [this.props.parse(value[0] + '') / this.props.factor, value[1]]
      );
    } else {
       data = data.map(
        (value: number[]) => [value[0], value[1]]
      );
    }

    data = data.map(
      (value: number[]) => [value[0], Math.log(1 + value[1])]
    );

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
      self.props.min !== undefined ? 
      self.props.min : 
      d3.min(data, (d: number[]) => d[0]);
      
    const xmax = 
      self.props.max !== undefined ? 
      self.props.max :
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
      .on('end', this.brushend);
          
    this.x = x;
    this.y = y;
    this.line = line;
    this.xAxis = xAxis;
    this.area = area;
    this.brush = brush;
  }

  render() {
    return (
      <div id={this.id} style={histogramStyle} />      
    );
  }

  componentWillReceiveProps(nextProps: HistogramProps) {
    let data = nextProps.data;    
    let desiredData: number[][] = [];

    if (this.props.factor) {
      desiredData = data.map(
        (value: [number, number, boolean]) => [this.props.parse(value[0] + '') / this.props.factor, value[1]]
      );
    } else {
      desiredData = 
        data.map(
          (value: [number, number, boolean]) => [value[0], value[1]]
        );
    }

    desiredData = desiredData.map(
      (value: [number, number]) => [value[0], Math.log(1 + value[1])]
    );
    
    this.y.domain([0, d3.max(data, (d) => d[1])]);            
   
    this.svg
        .select('.area')
          .datum(data)
          .transition()
          .duration(300)
          .attr('d', this.area)
        .select('g')
          .call(this.brush)
          .selectAll('rect')
          .transition()
          .duration(300)
          .attr('y', -6)
          .attr('height', height + 7)
          ;
 
    this.svg
      .select('.line')
      .datum(data)
      .transition()
      .duration(300)
      .attr('d', this.line);
  }

  componentDidMount() {   
    let data: number[][] = []; 
    if (this.props.factor) {
      data = data.map(
        (value: number[]) => [this.props.parse(value[0] + '') / this.props.factor, value[1]]
      );
    } else {
       data = data.map(
        (value: number[]) => [value[0], value[1]]
      );
    }
    
    this.svg = 
      d3.select('#' + this.id)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.svg.append('path')
       .datum(data)
       .attr('class', 'area')
       .attr('d', this.area);
        
    this.svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', this.line);
      
    this.svg.append('g')
       .attr('class', 'x brush')
       .call(this.brush)
       .selectAll('rect')
       .attr('y', -6)
       .attr('height', height + 7);

    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.xAxis)
        .selectAll('text')
        .attr('y', 0)
        .attr('x', 20)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(90)')
  }

  brushend() {
    let ext = this.brush.extent();
    let val0 = ext[0];
    let val1 = ext[1]; // todo rounding might need to be configurable
    if (val1 > val0) {
      const precision = this.props.precision || 4;

      if (this.props.factor) {
        this.props.facetHandler(
          [
            (this.props.factor * val0).toPrecision(precision), 
            (this.props.factor * val1).toPrecision(precision)
          ]); // facet values are strings everywhere for consistency
      } else {
        this.props.facetHandler(
          [
            val0.toPrecision(precision), 
            val1.toPrecision(precision)
          ]); // facet values are strings everywhere for consistency
      }
    }
  }
}

export { Histogram, HistogramProperties };