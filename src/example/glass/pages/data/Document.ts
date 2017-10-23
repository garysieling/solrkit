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
}

export { Document };