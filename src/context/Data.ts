interface ResponseHeader {
  status: number;
  QTime: number;
  params: {
    q: string;
  };
}

interface Response<T> {
  numFound: number;
  start: number;
  docs: T[];
}

export interface SolrResponse<T> {
  responseHeader: ResponseHeader;
  response: Response<T>;
}