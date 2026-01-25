export interface PoliciesListResponse {
    Data:           PolicyResponse[];
    PageNumber:     number;
    PagesTotal:     number;
    TotalItems:     number;
    IsSuccess:      boolean;
    ErrorCode:      number | null;
    ErrorMessage:   string | null;
    DisplayMessage: string | null;
    Links:          any[];
    Href:           string;
}

export interface PolicyResponse {
    CreatedOn:        Date;
    DateLastModified: Date;
    HasBeenModified:  boolean;
    Term:             string;
    PolicyType:       string;
    PackageType:      null;
    IsDeleted:        boolean;
    LOBList:          LOBList[];
    ProducerIDs:      number[];
    PriorPolicyID:    number | null;
    PolicyAgencyFees: PolicyAgencyFee[];
    AgentName:        string;
    MGA:              null;
    WritingCarrier:   string;
    LOB:              string;
    CustomerName:     string;
    PolicyId:         number;
    CustomerId:       number;
    PolicyNumber:     string;
    EffectiveDate:    Date;
    ExpirationDate:   Date;
    Status:           string;
    TotalPremium:     number;
    Description:      string;
    LOBId:            number;
    MGAId:            null;
    CarrierId:        number;
}

export interface LOBList {
    AcordCode:       string;
    InternalCode:    string;
    HasDetails:      boolean;
    IsPackage:       boolean;
    LOBDetailsGroup: string | null;
    ID:              number;
    Name:            string;
    Code:            string;
}


export interface PolicyAgencyFee {
    AgencyFeeName:    string;
    Amount:           number;
    AmountIsPercent:  string;
    CalculatedAmount: number;
}
