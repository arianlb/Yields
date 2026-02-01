export interface PolicyAdjustmentsResponse {
  AdjustmentId: number;
  AdjustmentDate: Date;
  AdjustmentType: string;
  Remarks: null | string;
  CSRId: number | null;
  PremiumChange: number;
  CommissionChange: number;
  DaysLapsed: number;
  EndorsementNumber: null;
  EndorsementStatus: null;
  AdjustmentReasons: AdjustmentReason[];
  PremiumDueToAgency: boolean;
  CarrierFeesAmount: null;
  CarrierFeesCommissionAmount: null;
}

export interface AdjustmentReason {
  ReasonId: number;
  ReasonDescription: string;
}
