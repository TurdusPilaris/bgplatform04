export type APIErrorsMessageType = {
  errorsMessages: APIErrorMessageType[];
};

export type APIErrorMessageType = { message: string; field: string };

export type PayloadTokenType = {
  userId: string;
  deviceId?: string | null;
};
