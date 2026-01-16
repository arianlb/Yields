export interface ContactsListResponse {
  Data: ContactResponse[];
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

export interface ContactResponse {
  isAPerson: boolean;
  CreatedOn: Date;
  HasBeenModified: boolean;
  DOB: string;
  MaritalStatusID: string;
  EntityID: number;
  DisplayName: string;
  TypeDisplay: string;
  ContactSubTypeDisplay: string;
  AgentName: string;
  StatusDisplay: string;
  ContactTypeDisplay: string;
  PhoneType: string;
  PrimaryContact: string;
  DateLastModified: Date;
  CustomerNo: string;
  ContactSubType: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Phone: string;
  Email: string;
  Line1: string;
  Line2: string;
  City: string;
  State: string;
  County: string;
  Zip: string;
  Country: string;
  LocationID: number;
  Status: string;
  ContactType: string;
  BusinessName: string;
}
