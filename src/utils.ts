
export function median(values: number[]): number {
    if (values.length === 0) {
        throw new Error("No values provided");
    }

    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid]! : (values[mid - 1]! + values[mid]!) / 2;
}