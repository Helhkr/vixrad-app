export interface ActionRule {
  id: string;
  triggerOptionId: string; // The ID of the option that triggers this rule
}

export interface Option {
  id: string;
  value: string;
  textToAdd: string; // Text to append to the report when this option is selected
}

export interface InteractiveElement {
  id: string;
  type: 'BUTTON_GROUP' | 'CHECKBOX' | 'TEXT_AREA';
  label: string;
  options?: Option[]; // For BUTTON_GROUP and CHECKBOX
  placeholder?: string; // For TEXT_AREA
}

export interface ElementGroup {
  id: string;
  name: string;
  interactiveElements: InteractiveElement[];
  actionRule?: ActionRule; // Optional rule for conditional visibility
}

export interface Subsection {
  id: string;
  name: string;
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
  baseContent: string; // Initial text for the report
  sections: Section[];
}
