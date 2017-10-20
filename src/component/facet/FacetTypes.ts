
type FacetValue = [string, number];
type FacetRenderer = (v: string, count: number) => string;

function defaultRenderer(value: string, count: number): string {
  return value;
}

interface FacetProps {
  title?: string;
  values: FacetValue[];
  render?: FacetRenderer;
}

export {
  FacetValue,
  FacetRenderer,
  defaultRenderer,
  FacetProps
};