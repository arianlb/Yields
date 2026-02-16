export interface DashboardData {
    stats: {
        name: string;
        amount: number;
        percentage: number;
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