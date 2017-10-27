
interface FacetValue {
  value: string;
  count: number;
  checked: boolean;
}

type FacetRenderer = (v: string, count: number) => string;

function defaultRenderer(value: string, count: number): string {
  return value;
}

interface FacetProps {
  title?: string;
  facet: string;
  values: FacetValue[];
  render?: FacetRenderer;
  help?: string;
}

export {
  FacetValue,
  FacetRenderer,
  defaultRenderer,
  FacetProps
};