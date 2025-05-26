// src/types.ts
export interface ChainActivity {
    chain: string;
    lastProcessedBlock: number;
    timestamp: string;
}

export interface HolderInfo {
    address: string;
    unified: {
        balance: string;
        amountDays: string;
        lastUpdated: string;
        standardDecimals: string;
        formattedBalance: string;
    }
    chains: {
        [key: string]: {
            balance: string;
            amountDays: string;
            lastUpdated: string;
            formattedBalance: string;
        }
    }
}

export interface HolderStatCounts {
    total: number;
    chains: {
        [key: string]: number;
    }
}