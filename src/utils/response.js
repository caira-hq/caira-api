const success = (res, data, message = 'OK', statusCode = 200) => {  
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Berhasil dibuat') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Terjadi kesalahan.', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

export { success, created, error };