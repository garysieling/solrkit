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

  train_1: string;
  train_2: string;
  train_3: string;
  train_4: string;
  train_5: string;

  prediction_1: string;
  prediction_2: string;
  prediction_3: string;
  prediction_4: string;
  prediction_5: string;

  confidence_1: number;
  confidence_2: number;
  confidence_3: number;
  confidence_4: number;
  confidence_5: number;
}

export { Document };