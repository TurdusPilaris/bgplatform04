export class CommonTestManager {
  expectPaginator(
    requestBody: any,
    countItems: number,
    pageSize: number = 10,
    pageNumber: number = 1,
  ) {
    const amountPages = Math.ceil(countItems / pageSize);
    const amountItems =
      pageNumber < amountPages
        ? pageSize
        : countItems - pageSize * (pageNumber - 1);
    expect(requestBody.totalCount).toBe(countItems);
    expect(requestBody.pageSize).toBe(pageSize);
    expect(requestBody.page).toBe(pageNumber);
    expect(requestBody.pagesCount).toBe(amountPages);
    expect(requestBody.items.length).toBe(amountItems);
  }
}
