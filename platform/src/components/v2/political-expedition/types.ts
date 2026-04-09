export type IssueCategory = "cooperatives" | "food_security" | "housing" | "small_business" | "transportation";

export type IssueOption = {
  key: IssueCategory;
  label: string;
  chapterSnippet: string;
};

export type BillItem = {
  id: string;
  billNumber: string;
  title: string;
  summary: string | null;
  status: string | null;
  districtTag: string;
};

export type LetterTemplateItem = {
  id: string;
  title: string;
  topic: IssueCategory;
  templateBody: string;
};

export type RepRecipient = {
  id: string;
  name: string;
  title: string;
  state: string;
  district: string | null;
};
