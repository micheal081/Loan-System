function formatData(data) {
  const {
    _id,
    full_name,
    username,
    email,
    telephone,
    address,
    postal_code,
    state,
    country,
    verified,
  } = data;

  const responseData = {
    _id,
    full_name,
    username,
    email,
    telephone,
    address,
    postal_code,
    state,
    country,
    verified,
  };

  return responseData;
}

module.exports = formatData;