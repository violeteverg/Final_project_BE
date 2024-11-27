const multer = require("multer");
const upload = require("../src/utils/multerConfig");
describe("Multer upload middleware", () => {
  const mockRequest = {};
  const mockCallback = jest.fn();

  test("Should allow valid image file types", () => {
    const mockFile = { mimetype: "image/jpeg" };
    upload.fileFilter(mockRequest, mockFile, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  test("Should reject invalid file types", () => {
    const mockFile = { mimetype: "application/pdf" };
    upload.fileFilter(mockRequest, mockFile, mockCallback);

    expect(mockCallback).toHaveBeenCalledWith(
      new Error("Unsupported file type!"),
      false
    );
  });
});
