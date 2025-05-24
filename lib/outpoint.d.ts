export type Rune = {
    id: string;
    name: string;
    spacedName: string;
    divisibility: number;
    spacers: number;
    symbol: string;
};
export type RuneOutput = {
    rune: Rune;
    balance: BigInt;
};
export type OutPoint = {
    runes: RuneOutput[];
    outpoint: {
        txid: string;
        vout: number;
    };
    output: {
        value: any;
        script: string;
    };
    height: number;
    txindex: number;
};
export declare function encodeOutpointInput(txid: string, pos: number): string;
export declare function decodeRunes(balances: any): RuneOutput[];
export declare function decodeOutpointViewBase(op: any): OutPoint;
export declare function decodeOutpointView(hex: string): OutPoint;
export declare function decodeRunesResponse(hex: string): {
    runes: Array<{
        runeId: string;
        name: string;
        divisibility: number;
        spacers: number;
        symbol: string;
    }>;
};
export declare function encodeBlockHeightInput(height: number): string;
export declare function encodeProtorunesByHeightInput(height: number, protocolTag: bigint): string;
export declare function encodeAlkanesIdToOutpointInput(block: bigint, tx: bigint): string;
export declare function decodeAlkanesIdToOutpointResponse(hex: string): {
    outpoint: {
        txid?: undefined;
        vout?: undefined;
    };
} | {
    outpoint: {
        txid: string;
        vout: number;
    };
};
export declare function encodeHoldersByTokenInput(block: bigint, tx: bigint): string;
export declare function decodeHoldersByTokenResponse(hex: string): {
    holders: {
        address: string;
        totalBalance: bigint;
        outpoints: {
            txid: string;
            vout: number;
            balance: bigint;
        }[];
    }[];
};
