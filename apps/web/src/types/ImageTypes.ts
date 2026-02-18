export interface ConversionItem {
    id: string;
    file: File;
    name: string;
    originalFormat: string;
    status: "pending" | "converting" | "completed" | "error";
    downloadUrl?: string;
    error?: string;
    blob?: Blob;
}
