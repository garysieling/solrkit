import { PaginationData, SolrCore, SearchParams } from './context/DataStore';

export { PaginationData, SolrCore, SearchParams };

import { DataStore } from './context/DataStore';
import { 
  DataBind,
  Bound, 
  databind 
} from './context/DataBinding';

const context = {
  DataStore,  
  DataBind,
  Bound, 
  databind
};

import { ExcelExport } from './component/ExcelExport';
import { MoreLikeThis } from './component/MoreLikeThis';
import { Pagination } from './component/Pagination';
import { ResultsList } from './component/ResultsList';
import { SearchBox } from './component/SearchBox';

const components = {
  ExcelExport,
  MoreLikeThis,
  Pagination,
  ResultsList,
  SearchBox
};

import { CheckFacet } from './component/facet/CheckFacet';
import { DropdownFacet } from './component/facet/DropdownFacet';
import { RadioFacet } from './component/facet/RadioFacet';
import { TagFacet } from './component/facet/TagFacet';
import { ToggleFacet } from './component/facet/ToggleFacet';

const facets = {
  CheckFacet,
  DropdownFacet,
  RadioFacet,
  TagFacet,
  ToggleFacet
};

import { DetailLayout } from './layout/DetailLayout';
import { ResultsLayout } from './layout/ResultsLayout';

const layout = {
  DetailLayout,
  ResultsLayout
};

export { context, components, facets, layout };