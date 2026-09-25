const response = {};

response.error = ({ response, status, message }) => {
  response?.status(status)?.json({
    message: message,
    status: status,
  });

  response.end();
  return status;
};

response.success = ({ response, status, message, data }) => {
  response.status(status).json({
    message: message,
    status: status,
    data: data,
  });
  response.end();
  return status;
};

module.exports = response;
