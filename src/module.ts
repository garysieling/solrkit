import * as DataBinding from './context/DataBinding';
import { 
  DataStore 
} from './context/DataStore';
import { databind } from './context/DataBinding';

const context = {
  DataBinding,
  DataStore,
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