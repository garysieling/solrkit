interface Document {
  id: string;
  file: string;
  url: string;
  place: string;
  height: number;
  width: number;
  channels: number;
  aspect: number;
  faces: string;
  face_count: number;
  resnet50_tags: string[];
  gv_labels: string[];
  gv_inscription: string[];
  gv_partial_matching_images: string[];
  gv_pages_matching_images: string[];
  gv_full_matching_images: string[];
}

export { Document };