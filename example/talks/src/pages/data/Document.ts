interface Talk {
  id: string;
  title_s: string;
  url_s: string;
}

interface Book {
  id: string;
  thumbnail_url_s: string;
  author_name_ss: string[];
  author_key_s: string;
  title_s: string;
}

export { 
  Talk, 
  Book 
};