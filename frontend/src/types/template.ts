export interface Option {
  id: string;
  value: string;
  textToAdd?: string; // Text to append to the report when this option is selected
  childElements?: InteractiveElement[]; // New field: nested interactive elements
}

export interface InteractiveElement {
  id: string;
  type: 'SEGMENTED' | 'CHECKBOX' | 'INPUT_NUMBER' | 'TEXT_AREA';
  label?: string; // Made optional
  isVisibleByDefault: boolean; // New field: whether the element is visible by default
  options?: Option[]; // For SEGMENTED and CHECKBOX
  placeholder?: string; // For INPUT_NUMBER and TEXT_AREA
}

export interface ElementGroup {
  id: string;
  name: string;
  interactiveElements: InteractiveElement[];
}

export interface Subsection {
  id: string;
  name: string;
  isActive: boolean; // Indicates if the subsection is active by default
  elementGroups: ElementGroup[];
}

export interface Section {
  id: string;
  name: string;
  subsections: Subsection[];
}

export interface Template {
  id: string;
  name: string;
  reportTitle: string; // Main title for the final report
  modality: string;
  sections: Section[];
}

export interface SelectedOptions {
  [elementId: string]: string | string[]; // Stores selected option IDs or text for text areas
}

export interface StructuredReport {
  title: string;
  sections: Array<{
    id: string;
    name: string;
    content: Array<{
      id: string;
      name: string;
      paragraphs: string[];
    }>;
  }>;
}