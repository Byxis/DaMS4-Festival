export interface Reservation {
    id: number;
    festival_id: number;
    entity_id: number;
    table_count: number;
    big_table_count: number;
    town_table_count: number;
    note: string | null;
    status: string;
    interactions?: ReservationInteraction[];
    games?: ReservationGame[];
}

export interface ReservationInteraction {
    id: number;
    reservation_id: number;
    description: string | null;
    interaction_date: string;
}

export interface ReservationGame {
    id: number;
    reservation_id: number;
    game_id: number;
    amount: number;
    table_count: number;
    big_table_count: number;
    town_table_count: number;
    status: string;
}

export enum ReservationStatus {
    TO_BE_CONTACTED = "TO_BE_CONTACTED",
    CONTACTED = "CONTACTED",
    IN_DISCUSSION = "IN_DISCUSSION",
    FACTURED = "FACTURED",
    CONFIRMED = "CONFIRMED",
    ABSENT = "ABSENT",
}

export enum ReservationGameStatus {
    ASKED = "ASKED",
    CONFIRMED = "CONFIRMED",
    RECEIVED = "RECEIVED",
    CANCELLED = "CANCELLED",
}
