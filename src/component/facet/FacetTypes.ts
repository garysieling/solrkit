
interface FacetValue {
  value: string;
  count: number;
  checked: boolean;
}

type FacetRenderer = (v: string, count: number) => string;

function defaultRenderer(label: string, value: number): string {
  return label + ': ' + value.toLocaleString();
}

interface FacetProps {
  title?: string;
  facet: string;
  values: FacetValue[];
  render?: FacetRenderer;
  help?: string;
  initialValues: string[];
}

export {
  FacetValue,
  FacetRenderer,
  defaultRenderer,
  FacetProps
};