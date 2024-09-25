export type APIErrorsMessageType = {
  errorsMessages: APIErrorMessageType[];
};

export type APIErrorMessageType = { field: string; message: string };
