export interface Note {
  id: string | number;
  note: string;
  created_at: string;
  version?: number;
  being_edited?: boolean;
  user?: {
    email: string;
  };
  tempId?: string;
  error?: boolean;
  [key: string]: any;
}