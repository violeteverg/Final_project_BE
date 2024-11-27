const responseStatusMsg = require("../src/helper/responseMessage");

describe("responseStatusMsg", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return success response with data when type is 'success_data' and data is provided", () => {
    const mockData = { id: 1, name: "Test" };
    const code = 200;
    const message = "Success";
    const type = "success_data";

    responseStatusMsg(res, code, message, type, mockData, undefined);

    expect(res.status).toHaveBeenCalledWith(code);
    expect(res.json).toHaveBeenCalledWith({
      code: code,
      message: message,
      result: mockData,
    });
  });

  it("should return success response with default message when type is 'success_data' and no message is provided", () => {
    const mockData = { id: 1, name: "Test" };
    const code = 200;
    const type = "success_data";

    responseStatusMsg(res, code, undefined, type, mockData, undefined);

    expect(res.status).toHaveBeenCalledWith(code);
    expect(res.json).toHaveBeenCalledWith({
      code: code,
      message: "Success",
      result: mockData,
    });
  });

  it("should return error response when type is 'error' and error is provided", () => {
    const code = 400;
    const message = "Error occurred";
    const type = "error";
    const error = "Some error message";

    responseStatusMsg(res, code, message, type, undefined, error);

    expect(res.status).toHaveBeenCalledWith(code);
    expect(res.json).toHaveBeenCalledWith({
      code: code,
      message: message,
      error: error,
    });
  });

  it("should return error response with default message when type is 'error' and no message is provided", () => {
    const code = 400;
    const type = "error";
    const error = "Some error message";

    responseStatusMsg(res, code, undefined, type, undefined, error);

    expect(res.status).toHaveBeenCalledWith(code);
    expect(res.json).toHaveBeenCalledWith({
      code: code,
      message: "Unknown status",
      error: error,
    });
  });

  it("should return error response when type is 'error' and error is not provided", () => {
    const code = 400;
    const type = "error";
    const message = "Error occurred";

    responseStatusMsg(res, code, message, type, undefined, undefined);

    expect(res.status).toHaveBeenCalledWith(code);
    expect(res.json).toHaveBeenCalledWith({
      code: code,
      message: message,
      error: undefined,
    });
  });
});
