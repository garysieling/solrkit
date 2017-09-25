import * as React from 'react';
import './App.css';

import Histogram from './components/Histogram';

const logo = require('./logo.svg');

const histogramData: [number, number, boolean][] = [
  [2019,3,false],[2018,1,false],[2017,1126,false],[2016,7848,false],
  [2015,10738,false],[2014,7620,false],[2013,7993,false],[2012,6872,false],
  [2011,4483,false],[2010,2527,false],[2009,1331,false],[2008,851,false],
  [2007,633,false],[2006,213,false],[2005,179,false],[2004,135,false],
  [2003,87,false],[2002,83,false],[2001,231,false],[2000,101,false],
  [1999,141,false],[1998,75,false],[1997,140,false],[1996,315,false],
  [1995,310,false],[1994,173,false],[1993,104,false],[1992,36,false],
  [1991,23,false],[1990,38,false],[1989,33,false],[1988,69,false],
  [1987,73,false],[1986,71,false],[1985,270,false],[1984,82,false],
  [1983,405,false],[1982,61,false],[1981,73,false],[1980,29,false],
  [1979,28,false],[1978,28,false],[1977,37,false],[1976,15,false],
  [1975,21,false],[1974,37,false],[1973,60,false],[1972,73,false],
  [1971,74,false],[1970,106,false],[1969,155,false],[1968,131,false],
  [1967,225,false],[1966,188,false],[1965,239,false],[1964,201,false],
  [1963,147,false],[1962,46,false],[1961,101,false],[1960,151,false],
  [1959,73,false],[1958,76,false],[1957,122,false],[1956,48,false],
  [1955,74,false],[1954,31,false],[1953,47,false],[1952,63,false],
  [1951,55,false],[1950,196,false],[1949,33,false],[1948,43,false],
  [1947,33,false],[1946,32,false],[1945,74,false],[1944,53,false],
  [1943,49,false],[1942,34,false],[1941,53,false],[1940,133,false]];

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <div className="App-intro">
          <Histogram data={histogramData} />
        </div>
      </div>
    );
  }
}

export default App;
