export interface ContactInfoResponse {
    CustomerID:          number;
    CustomerNo:          string;
    AgentID:             number;
    Agent:               string;
    CsrID:               number;
    CSR:                 string;
    CustomerPriorityID:  number;
    CustomerPriority:    string;
    CustomerSince:       Date;
    UserID:              string;
    UserPassword:        string;
    Type:                string;
    OfficeID:            number;
    CPAccess:            boolean;
    Name:                string;
    CustomerSourceID:    number;
    CustomerSource:      string;
    SourceDetail:        string;
    CreatedByID:         number;
    CreatedByName:       string;
    CustomerSinceString: string;
}