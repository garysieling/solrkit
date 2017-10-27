import * as DataBinding from './context/DataBinding';
import * as DataStore from './context/DataStore';
import * as Data from './context/Data';

const context = {
  DataBinding,
  DataStore,
  Data
};

import * as ExcelExport from './component/ExcelExport';
import * as MoreLikeThis from './component/MoreLikeThis';
import * as Pagination from './component/Pagination';
import * as ResultsList from './component/ResultsList';
import * as SearchBox from './component/SearchBox';

const components = {
  ExcelExport,
  MoreLikeThis,
  Pagination,
  ResultsList,
  SearchBox
};

import * as CheckFacet from './component/facet/CheckFacet';
import * as DropdownFacet from './component/facet/DropdownFacet';
import * as FacetTypes from './component/facet/FacetTypes';
import * as RadioFacet from './component/facet/RadioFacet';
import * as TagFacet from './component/facet/TagFacet';
import * as ToggleFacet from './component/facet/ToggleFacet';

const facets = {
  CheckFacet,
  DropdownFacet,
  FacetTypes,
  RadioFacet,
  TagFacet,
  ToggleFacet
};

import * as DetailLayout from './layout/DetailLayout';
import * as ResultsLayout from './layout/ResultsLayout';

const layout = {
  DetailLayout,
  ResultsLayout
};

export { context, components, facets, layout };