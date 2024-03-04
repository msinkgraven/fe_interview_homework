interface ApiResponseSuccess {
    success: true;
    data: any;
}

interface ApiResponseError {
    success: false;
    error: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;

interface Task {
    original_repeated_task_id?: null,
    color_id: number,
    visible_properties: string[],
    estimate_skips_weekend: boolean,
    end_time?: null,
    estimate_type: "total" | "daily",
    comments: string[],
    created_at: string,
    created_by: number,
    tracking?: unknown,
    id: number,
    tag_ids: any[],
    tracked: boolean,
    timeline_segment_id?: number,
    name: string,
    repetition_rule?: unknown,
    plan_id?: number,
    parent_id?: number,
    attachments: unknown[],
    workspace_members: unknown[],
    done_checklist_items_count: number,
    weight: number,
    task_type: "string",
    end_date: string,
    status: "to-do" | "done" | "in-progress" | "blocked",
    has_notes: boolean,
    estimated_minutes: number,
    is_last_repetition: boolean,
    done: boolean,
    updated_by: number,
    plan_status_position?: unknown,
    updated_at: string,
    total_checklist_items_count: number,
    start_date: string,
    start_time?: string,
    daily_estimated_minutes: number,
    color: number,
    folder_id?: number,
}

interface Resizeable {
    id: number | null;
    offset: number;
    side: 'left' | 'right' | null;
    distanceMoved: number;
}
