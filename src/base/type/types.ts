export type APIErrorsMessageType = {
  errorsMessages: APIErrorMessageType[];
};

export type APIErrorMessageType = { message: string; field: string };
