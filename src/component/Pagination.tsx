import * as React from 'react';
import { Menu } from 'semantic-ui-react';
import * as _ from 'lodash';
import 'semantic-ui-css/semantic.min.css';

interface PaginationProps {
  numRows: number;
  pageSize: number;
  start: number;
}

interface PaginationState {
  activePage: number;
}

// TODO split into it's own file
const PaginationProperties = [
  {
    name: 'data',
    display: 'Data',
    type: 'object[]'
  },
  {
    name: 'pageSize',
    display: 'Page Size',
    type: 'number',
    default: 10
  }
];

class Pagination extends React.Component<PaginationProps, PaginationState> {
  constructor() {
    super();
  }

  handlePaging(idx: number) {    
    return () => {
      this.setState({ activePage: idx });
    };
  }

  render() {
    const self = this;
    const pageSize = self.props.pageSize || 10;
    const numRows = self.props.numRows || 0;
    let activePage = 1 + self.props.start / pageSize;
       
    const maxPage = Math.ceil(numRows / pageSize);
    if (maxPage < activePage) {
      activePage = maxPage;
    }

    const pages: number[] = 
      maxPage > 0 ?
        _.takeRight(
          _.takeWhile(
            _.range(1, Math.max(maxPage, 1)),
            (value: number, index: number, array: number[]) => 
              index < activePage + 2
          ),
          5) :
        [1];

    if (pages[0] !== 1) {
      pages.unshift(-1);
      pages.unshift(1);
    }

    if (pages[pages.length - 1] < maxPage) {
      pages.push(-1);
      pages.push(maxPage);
    }

    const menuItems = (
      pages.map(
        (idx: number) => 
          idx === -1 ? 
          (
            <Menu.Item key={idx} disabled={true}>...</Menu.Item>
          ) : (
            <Menu.Item
              key={idx}
              name={idx + ''} 
              active={activePage === idx} 
              onClick={this.handlePaging(idx)} 
            />
          )
      )
    );

    return (
      <Menu pagination={true}>
        {menuItems}
      </Menu>
    );
  }
}

export {
  Pagination,
  PaginationProperties
};