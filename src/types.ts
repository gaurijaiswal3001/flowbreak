export type TestCategory = 'required' | 'format' | 'length' | 'range' | 'pattern' | 'structure';

export interface TestCaseResult {
  id: string;
  field: string;
  fieldIdentifier: string;
  fieldType: string;
  category: TestCategory;
  testCase: string;
  expected: string;
  actual: string;
  status: 'passed' | 'failed';
  detail: string;
  inputTested?: string;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  fieldsCount: number;
  verdict: 'survived' | 'busted' | 'empty';
}

export interface ExplainedIssue {
  fieldName: string;
  testCase: string;
  diagnosis: string;
  fixExplanation: string;
  codeFix: string;
}

export interface GeminiExplanation {
  overview: string;
  issues: ExplainedIssue[];
  repairedSnippet: string;
  proTips: string[];
}

export interface FormSample {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  html: string;
}
