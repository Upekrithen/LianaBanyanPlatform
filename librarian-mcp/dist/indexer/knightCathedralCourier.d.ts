export interface CourierResult {
    newQueueTablets: number;
    newHandoffTablets: number;
    newTagTablets: number;
    total: number;
}
/** Main entry: run the Knight Cathedral Courier. */
export declare function runKnightCathedralCourier(): Promise<CourierResult>;
