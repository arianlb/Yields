export interface DashboardData {
    stats: {
        name: string;
        amount: number;
        percentage: string;
    }[];
    topAgents: {
        name: string;
        sales: number;
    }[];
    topSources: {
        name: string;
        sales: number;
    }[];
}