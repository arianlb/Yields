export interface ContactNotesResponse {
  Data: NoteResponse[];
  PageNumber: number;
  PagesTotal: number;
  TotalItems: number;
  IsSuccess: boolean;
  ErrorCode: null;
  ErrorMessage: null;
  DisplayMessage: null;
  Links: any[];
  Href: string;
}

export interface NoteResponse {
  Id: number;
  Comment: string;
  CreatedBy: string;
  EmployeeId: number;
  CreatedOn: Date;
  ModifiedAt: string;
  ModifiedBy: null;
  ParentId: number;
  AssignedPolicyId: number;
  AssignedContactId: number;
  Important: boolean;
  RelatedNotes: any[];
  BulkInsertId: null;
  BulkInsertSessionId: null;
  IsPinned: boolean;
  NotesHistories: null;
}
