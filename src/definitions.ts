export type Token = {
    token: string;
    conversationSid: string;
    identity: string;
    expiration: string;
};

export type FileAttachmentConfig = {
    enabled?: boolean;
    maxFileSize?: number;
    acceptedExtensions?: string[];
};

export type VideoMessageAttributes = {
    hasVideo?: boolean;
    uniqueCode?: string;
    videoUrl?: string;
};
