export interface PoliciesByClientResponse {
  Data: PolicyResponse[];
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

export interface PolicyResponse {
  AgentName: string;
  MGA: null;
  WritingCarrier: string;
  LOB: string;
  CustomerName: string;
  PolicyId: number;
  CustomerId: number;
  PolicyNumber: string;
  EffectiveDate: Date;
  ExpirationDate: Date;
  Status: string;
  TotalPremium: number;
  Description: string;
  LOBId: number;
  MGAId: null;
  CarrierId: number;
}
