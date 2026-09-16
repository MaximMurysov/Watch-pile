import { getQueryErrorMessage } from "./get-query-error-message";

describe("getQueryErrorMessage", () => {
  it("возвращает сообщение об отсутствии сети для FETCH_ERROR", () => {
    expect(
      getQueryErrorMessage({ status: "FETCH_ERROR", error: "network down" }),
    ).toBe("Не удалось выполнить запрос. Проверьте подключение к интернету");
  });

  it("возвращает сообщение об отсутствии сети для TIMEOUT_ERROR", () => {
    expect(
      getQueryErrorMessage({ status: "TIMEOUT_ERROR", error: "timed out" }),
    ).toBe("Не удалось выполнить запрос. Проверьте подключение к интернету");
  });

  it("возвращает текст CUSTOM_ERROR как есть (например, ошибку валидации схемы)", () => {
    expect(
      getQueryErrorMessage({
        status: "CUSTOM_ERROR",
        error: "Сервер вернул данные в неожиданном формате",
      }),
    ).toBe("Сервер вернул данные в неожиданном формате");
  });

  it("возвращает текст PARSING_ERROR как есть", () => {
    expect(
      getQueryErrorMessage({
        status: "PARSING_ERROR",
        originalStatus: 200,
        data: "not json",
        error: "не удалось разобрать ответ",
      }),
    ).toBe("не удалось разобрать ответ");
  });

  it("формирует сообщение по числовому HTTP-статусу", () => {
    expect(getQueryErrorMessage({ status: 500, data: null })).toBe(
      "Сервер вернул ошибку (500)",
    );
  });

  it("использует message из SerializedError, если он есть", () => {
    expect(getQueryErrorMessage({ message: "что-то пошло не так" })).toBe(
      "что-то пошло не так",
    );
  });

  it("возвращает сообщение по умолчанию для SerializedError без message", () => {
    expect(getQueryErrorMessage({})).toBe("Не удалось загрузить данные");
  });

  it("возвращает сообщение по умолчанию, если ошибки нет", () => {
    expect(getQueryErrorMessage(undefined)).toBe("Не удалось загрузить данные");
  });
});
