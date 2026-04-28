export type StoryType = 'info' | 'alert' | 'success';

export interface Story {
  title: string;
  text: string;
  type?: StoryType;
}
