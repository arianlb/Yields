export interface DashboardData {
    stats: {
        name: string;
        amount: number;
        percentage: number;
    }[];
    topAgents: {
        name: string;
        sales: number;
        percentage: number;
    }[];
    topSources: {
        name: string;
        sales: number;
        percentage: number;
    }[];
}