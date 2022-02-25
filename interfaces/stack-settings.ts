export interface StackConfig {
  projectName: string;
  env: string;
  region?: string;
  stackTags?: {
    [key: string]: string;
  };
  stackProps?: {
    [key: string]: string;
  };
}
