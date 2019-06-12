export function formatNumber(number: number): string {
    if(number.toString().length > 4) {
        return number.toPrecision(2);
    }
    return number.toFixed(Math.max(1, number.toString().length - 2));
}
