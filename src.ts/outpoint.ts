import { protorune as protobuf } from "./proto/protorune";
import { stripHexPrefix } from "./utils";
import { toUint128, fromUint128, u128ToBuffer } from "./bytes";
const {
  OutpointResponse,
  Outpoint,
  BalanceSheet,
  RunesResponse,
  ProtorunesByHeightRequest,
  RunesByHeightRequest,
} = protobuf;
import { alkanes as alkanes_protobuf } from "./proto/alkanes";

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

export function encodeOutpointInput(txid: string, pos: number): string {
  const input: any = {
    txid: (Buffer as any).from(txid, "hex") as Buffer,
    vout: pos,
  };
  const str = Buffer.from(new Outpoint(input).serializeBinary()).toString(
    "hex"
  );
  return "0x" + str;
}

export function decodeRunes(balances: any): RuneOutput[] {
  if (!balances) return [];
  return balances.entries.map((entry) => {
    const balance = entry.balance;
    const d = entry.rune;
    const spacer = "•";
    const bitField = d.spacers.toString(2);
    let name = d.name;
    let spaced_name = name;
    const symbol = d.symbol;
    let x = 0;
    bitField
      .split("")
      .reverse()
      .map((d, i) => {
        if (d == "1") {
          spaced_name = `${spaced_name.slice(0, i + 1 + x)}${spacer}${spaced_name.slice(i + 1 + x)}`;
          x++;
        }
      });
    const rune: any = {
      id: {
        block: fromUint128(d.runeId.height),
        tx: fromUint128(d.runeId.txindex),
      },
      name,
      spacedName: spaced_name,
      divisibility: d.divisibility,
      spacers: d.spacers,
      symbol: symbol,
    };
    return {
      rune,
      balance: fromUint128(balance),
    };
  });
}
export function decodeOutpointViewBase(op: any): OutPoint {
  return {
    runes: decodeRunes(op.balances),
    outpoint: {
      txid: (Buffer as any).from(op.outpoint.txid).toString("hex"),
      vout: op.outpoint.vout,
    },
    output: op.output
      ? {
          value: op.output.value,
          script: (Buffer as any)
            .from(op.output.script)
            .toString("hex") as string,
        }
      : { value: "", script: "" },
    height: op.height,
    txindex: op.txindex,
  };
}

export function decodeOutpointView(hex: string): OutPoint {
  const bytes = (Uint8Array as any).from(
    (Buffer as any).from(stripHexPrefix(hex), "hex") as Buffer
  ) as Uint8Array;
  const op = OutpointResponse.deserializeBinary(bytes);
  return decodeOutpointViewBase(op);
}

export function decodeRunesResponse(hex: string): {
  runes: Array<{
    runeId: string;
    name: string;
    divisibility: number;
    spacers: number;
    symbol: string;
  }>;
} {
  if (!hex || hex === "0x") {
    return { runes: [] };
  }
  const buffer = Buffer.from(stripHexPrefix(hex), "hex");
  if (buffer.length === 0) {
    return { runes: [] };
  }
  const response = RunesResponse.deserializeBinary(buffer);

  return {
    runes: response.runes.map((rune) => ({
      runeId: `${rune.runeId?.height || 0}:${rune.runeId?.txindex || 0}`,
      name: Buffer.from(rune.name).toString("utf8"),
      divisibility: rune.divisibility,
      spacers: rune.spacers,
      symbol: rune.symbol,
    })),
  };
}

export function encodeBlockHeightInput(height: number): string {
  const input: any = {
    height: height,
  };
  const str = Buffer.from(
    new RunesByHeightRequest(input).serializeBinary()
  ).toString("hex");
  return "0x" + str;
}

export function encodeProtorunesByHeightInput(
  height: number,
  protocolTag: bigint
): string {
  const input: any = {
    height: height,
    protocol_tag: toUint128(protocolTag),
  };
  const str = Buffer.from(
    new ProtorunesByHeightRequest(input).serializeBinary()
  ).toString("hex");
  return "0x" + str;
}

export function encodeAlkanesIdToOutpointInput(
  block: bigint,
  tx: bigint
): string {
  const alkane_id = new alkanes_protobuf.AlkaneId({
    block: toUint128(block),
    tx: toUint128(tx),
  });
  const str = Buffer.from(
    new alkanes_protobuf.AlkaneIdToOutpointRequest({
      id: alkane_id,
    }).serializeBinary()
  ).toString("hex");
  return "0x" + str;
}

export function decodeAlkanesIdToOutpointResponse(hex: string) {
  if (!hex || hex === "0x") {
    return { outpoint: {} };
  }
  const buffer = Buffer.from(stripHexPrefix(hex), "hex");
  if (buffer.length === 0) {
    return { outpoint: {} };
  }
  const response =
    alkanes_protobuf.AlkaneIdToOutpointResponse.deserializeBinary(buffer);
  return {
    outpoint: {
      txid: Buffer.from(response.txid).toString("hex"),
      vout: response.vout,
    },
  };
}

export function encodeHoldersByTokenInput(
  block: bigint,
  tx: bigint
): string {
  const alkane_id = new alkanes_protobuf.AlkaneId({
    block: toUint128(block),
    tx: toUint128(tx),
  });
  const str = Buffer.from(
    new alkanes_protobuf.HoldersByTokenRequest({
      token_id: alkane_id,
    }).serializeBinary()
  ).toString("hex");
  return "0x" + str;
}

export function decodeHoldersByTokenResponse(hex: string) {
  if (!hex || hex === "0x") {
    return { holders: [] };
  }
  const buffer = Buffer.from(stripHexPrefix(hex), "hex");
  if (buffer.length === 0) {
    return { holders: [] };
  }
  const response =
    alkanes_protobuf.HoldersByTokenResponse.deserializeBinary(buffer);
  return {
    holders: response.holders.map(holder => ({
      address: holder.address,
      totalBalance: fromUint128(holder.total_balance),
      outpoints: holder.outpoints.map(outpoint => ({
        txid: Buffer.from(outpoint.txid).toString("hex"),
        vout: outpoint.vout,
        balance: fromUint128(outpoint.balance),
      })),
    })),
  };
}
