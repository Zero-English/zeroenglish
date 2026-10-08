export type TemplateType =
  | "QUIZ_POSTER"
  | "CONTRIBUTOR_CERTIFICATE"
  | "VOCABULARY_POSTER"
  | "LEADERBOARD_POSTER"
  | "ACHIEVEMENT"
  | "COURSE_CERTIFICATE"
  | "EVENT_POSTER"
  | "SOCIAL_POST"
  | "ANNOUNCEMENT";

export type TemplateElementType =
  | "text"
  | "dynamic-text"
  | "image"
  | "dynamic-image"
  | "shape"
  | "line"
  | "qrcode";

export interface BaseElement {
  id: string;
  type: TemplateElementType;
  x: number;          // Left position in px
  y: number;          // Top position in px
  width: number;
  height: number;
  rotation?: number;  // 0 - 360 deg
  opacity?: number;   // 0 - 1
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: "text" | "dynamic-text";
  content?: string;             // Raw text or fallback
  field?: string;               // e.g. "{{quiz.question}}" or "{{contributor.name}}"
  fontFamily: string;           // "Inter" | "Poppins" | "Hind Siliguri" | "Playfair Display" | "Roboto"
  fontSize: number;             // in px
  fontWeight: number;           // 400 | 500 | 600 | 700 | 800
  color: string;                // Hex / RGBA
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight?: number;
  letterSpacing?: number;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  stroke?: string;
  strokeWidth?: number;
}

export interface ImageElement extends BaseElement {
  type: "image" | "dynamic-image";
  src?: string;                 // URL or Media URL
  mediaId?: number;
  field?: string;               // e.g. "{{contributor.profilePhoto}}"
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  isCircle?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeType: "rectangle" | "circle" | "badge";
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

export interface LineElement extends BaseElement {
  type: "line";
  stroke: string;
  strokeWidth: number;
  strokeDashArray?: number[];
  orientation: "horizontal" | "vertical";
}

export interface QRCodeElement extends BaseElement {
  type: "qrcode";
  value?: string;               // Static URL or field e.g. "{{quiz.url}}"
  field?: string;
  darkColor?: string;
  lightColor?: string;
}

export type TemplateElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | LineElement
  | QRCodeElement;

export interface TemplateDefinition {
  version: "1.0";
  width: number;
  height: number;
  backgroundColor?: string;
  backgroundMediaId?: number;
  backgroundMediaUrl?: string;
  backgroundFit?: "cover" | "contain" | "fill";
  elements: TemplateElement[];
}

export interface DynamicFieldDefinition {
  key: string;            // e.g. "{{quiz.question}}"
  label: string;          // e.g. "Question Text"
  category: TemplateType | "ALL";
  sampleValue: string;    // e.g. "What is the synonym of 'Abundant'?"
  type: "text" | "image" | "url";
  description?: string;
}

export interface ResolvedTemplateData {
  [key: string]: string;
}
