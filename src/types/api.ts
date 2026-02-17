export interface Paging {
    current_page: number;
    size: number;
    total_page: number;
}

export interface PaginatedResponse<T> {
    data: T;
    paging: Paging;
}

export interface WebResponse<T> {
    data: T;
    meta?: {
        timestamp: string;
        path: string;
    };
    paging?: Paging;
}
