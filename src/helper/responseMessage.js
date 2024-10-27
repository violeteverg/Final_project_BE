const responseStatusMsg = (res, code, message, type, data, error) => {
  const response = {
    code: code,
    message:
      message || (type === "success_data" ? "Success" : "Unknown status"),
  };

  if (type === "success_data" && data !== undefined) {
    response.result = data;
  } else if (type === "error" && error !== undefined) {
    response.error = error;
  }

  return res.status(code).json(response);
};

module.exports = responseStatusMsg;
